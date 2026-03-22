<?php

namespace App\Http\Controllers;

use App\Models\Blog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class BlogController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(Blog::orderBy('date_from', 'desc')->get());
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'task' => 'required|string|max:50',
            'week' => 'required|string|max:20',
            'date' => 'nullable|date',
            'date_from' => 'required|date',
            'date_to' => 'required|date|after_or_equal:date_from',
            'read_time' => 'required|string|max:20',
            'featured_image' => 'required|file|mimes:jpg,jpeg,png,webp|max:2048',
            'documentation_images' => 'required|array|size:2',
            'documentation_images.*' => 'required|file|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        if (empty($validated['date_from']) && !empty($validated['date'])) {
            $validated['date_from'] = $validated['date'];
        }

        unset($validated['date']);

        try {
            // Create blog record first
            $blogData = $validated;
            unset($blogData['featured_image']);
            unset($blogData['documentation_images']);
            $blog = Blog::create($blogData);

            // Handle featured image upload
            if ($request->hasFile('featured_image')) {
                $file = $request->file('featured_image');
                $fileName = time() . '_' . str_replace(' ', '_', $file->getClientOriginalName());
                $directory = 'blogs/' . $blog->id . '/featured';
                Storage::disk('supabase')->putFileAs($directory, $file, $fileName, ['visibility' => 'public']);
                $blog->featured_image = $directory . '/' . $fileName;
                $blog->save();
            }

            // Handle documentation images upload
            if ($request->hasFile('documentation_images')) {
                $docPaths = [];
                foreach ($request->file('documentation_images') as $index => $file) {
                    if ($file && $file->isValid()) {
                        $fileName = time() . '_' . $index . '_' . str_replace(' ', '_', $file->getClientOriginalName());
                        $directory = 'blogs/' . $blog->id . '/docs';
                        Storage::disk('supabase')->putFileAs($directory, $file, $fileName, ['visibility' => 'public']);
                        $docPaths[] = $directory . '/' . $fileName;
                    }
                }
                $blog->documentation_images = json_encode($docPaths);
                $blog->save();
            }

            return response()->json($blog, 201);
        } catch (\Exception $e) {
            \Log::error('Blog creation failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create blog.'], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        return response()->json(Blog::findOrFail($id));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        \Log::info('Update method called for blog ID: ' . $id);
        \Log::info('Request method: ' . $request->method());
        \Log::info('Request data: ', $request->all());
        
        $blog = Blog::findOrFail($id);
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'task' => 'required|string|max:50',
            'week' => 'required|string|max:20',
            'date' => 'nullable|date',
            'date_from' => 'required|date',
            'date_to' => 'required|date|after_or_equal:date_from',
            'read_time' => 'required|string|max:20',
            'featured_image' => 'nullable|file|mimes:jpg,jpeg,png,webp|max:2048',
            'documentation_images' => 'nullable|array',
            'documentation_images.*' => 'file|mimes:jpg,jpeg,png,webp|max:2048',
            'remove_featured_image' => 'nullable|in:0,1',
            'remove_documentation_images' => 'nullable|array',
            'remove_documentation_images.*' => 'string',
        ]);

        if (empty($validated['date_from']) && !empty($validated['date'])) {
            $validated['date_from'] = $validated['date'];
        }

        unset($validated['date']);

        $fieldErrors = [];

        $removingFeatured = $request->input('remove_featured_image') === '1';
        $hasNewFeatured = $request->hasFile('featured_image');
        $existingFeatured = $blog->getOriginal('featured_image');
        $hasExistingFeatured = !empty($existingFeatured) && is_string($existingFeatured);
        if (($removingFeatured || !$hasExistingFeatured) && !$hasNewFeatured) {
            $fieldErrors['featured_image'] = ['Featured image is required.'];
        }

        $existingDocs = $blog->documentation_images;
        $existingDocsCount = is_array($existingDocs) ? count($existingDocs) : 0;
        $removeDocs = $request->input('remove_documentation_images', []);
        $removeDocsCount = is_array($removeDocs) ? count(array_filter($removeDocs, fn ($x) => is_string($x) && $x !== '')) : 0;
        $newDocs = $request->file('documentation_images', []);
        $newDocsCount = is_array($newDocs) ? count(array_filter($newDocs, fn ($f) => $f && $f->isValid())) : 0;

        $remainingExisting = max(0, $existingDocsCount - $removeDocsCount);
        $totalDocsAfter = $remainingExisting + $newDocsCount;
        if ($totalDocsAfter !== 2) {
            $fieldErrors['documentation_images'] = ['You must have exactly 2 documentation images.'];
        }

        if (!empty($fieldErrors)) {
            return response()->json([
                'message' => 'The given data was invalid.',
                'errors' => $fieldErrors,
            ], 422);
        }

        try {
            // Update blog data
            $blogData = $validated;
            unset($blogData['featured_image']);
            unset($blogData['documentation_images']);
            unset($blogData['remove_featured_image']);
            unset($blogData['remove_documentation_images']);
            $blog->update($blogData);

            // Remove featured image if requested
            if ($request->input('remove_featured_image') === '1') {
                $existingFeatured = $blog->getOriginal('featured_image');
                if (!empty($existingFeatured) && is_string($existingFeatured)) {
                    if (str_starts_with($existingFeatured, 'blogs/')) {
                        Storage::disk('supabase')->delete($existingFeatured);
                    } else {
                        $existingFeaturedPath = public_path($existingFeatured);
                        \Log::info('Removing featured image path: ' . $existingFeaturedPath);

                        if (is_file($existingFeaturedPath)) {
                            File::delete($existingFeaturedPath);
                            $parentDir = dirname($existingFeaturedPath);
                            if (is_dir($parentDir)) {
                                File::deleteDirectory($parentDir);
                            }
                        } elseif (is_dir($existingFeaturedPath)) {
                            File::deleteDirectory($existingFeaturedPath);
                        }
                    }
                }

                $blog->featured_image = null;
                $blog->save();
                $blog->refresh();
            }

            // Remove selected documentation images if requested
            $removeDocs = $request->input('remove_documentation_images', []);
            if (is_array($removeDocs) && count($removeDocs) > 0) {
                \Log::info('Removing documentation images: ', $removeDocs);

                foreach ($removeDocs as $src) {
                    if (!is_string($src) || $src === '') {
                        continue;
                    }
                    if (str_starts_with($src, 'blogs/')) {
                        Storage::disk('supabase')->delete($src);
                    } else {
                        $filePath = public_path($src);
                        if (is_file($filePath)) {
                            File::delete($filePath);
                        }
                    }
                }

                $existingDocs = $blog->getOriginal('documentation_images');
                if (!empty($existingDocs) && is_string($existingDocs)) {
                    $decoded = json_decode($existingDocs, true);
                    if (is_array($decoded)) {
                        $remaining = array_values(array_filter($decoded, fn($p) => is_string($p) && $p !== '' && !in_array($p, $removeDocs, true)));
                        $blog->documentation_images = json_encode($remaining);
                        $blog->save();
                        $blog->refresh();
                    } else {
                        $existingDocsPath = public_path($existingDocs);
                        if (is_dir($existingDocsPath)) {
                            $remaining = glob($existingDocsPath . '/*');
                            $remainingFiles = array_filter($remaining ?: [], fn($p) => is_file($p));
                            if (count($remainingFiles) === 0) {
                                File::deleteDirectory($existingDocsPath);
                                $blog->documentation_images = null;
                                $blog->save();
                                $blog->refresh();
                            }
                        }
                    }
                }
            }

            // Handle featured image upload
            if ($request->hasFile('featured_image')) {
                $existingFeatured = $blog->getOriginal('featured_image');
                if (!empty($existingFeatured) && is_string($existingFeatured) && str_starts_with($existingFeatured, 'blogs/')) {
                    Storage::disk('supabase')->delete($existingFeatured);
                }

                $file = $request->file('featured_image');
                $fileName = time() . '_' . str_replace(' ', '_', $file->getClientOriginalName());
                $directory = 'blogs/' . $blog->id . '/featured';
                Storage::disk('supabase')->putFileAs($directory, $file, $fileName, ['visibility' => 'public']);
                $blog->featured_image = $directory . '/' . $fileName;
                $blog->save();
                $blog->refresh();
            }

            // Handle documentation images upload
            if ($request->hasFile('documentation_images')) {
                $existingDocsValue = $blog->getOriginal('documentation_images');
                $existingPaths = [];

                if (!empty($existingDocsValue) && is_string($existingDocsValue)) {
                    $decoded = json_decode($existingDocsValue, true);
                    if (is_array($decoded)) {
                        $existingPaths = array_values(array_filter(
                            $decoded,
                            fn ($p) => is_string($p) && $p !== '' && !in_array($p, $removeDocs, true)
                        ));
                    }
                }

                $docPaths = $existingPaths;
                foreach ($request->file('documentation_images') as $index => $file) {
                    if ($file && $file->isValid()) {
                        $fileName = time() . '_' . $index . '_' . str_replace(' ', '_', $file->getClientOriginalName());
                        $directory = 'blogs/' . $blog->id . '/docs';
                        Storage::disk('supabase')->putFileAs($directory, $file, $fileName, ['visibility' => 'public']);
                        $docPaths[] = $directory . '/' . $fileName;
                    }
                }

                $blog->documentation_images = json_encode(array_values($docPaths));
                $blog->save();
                $blog->refresh();
            }

            \Log::info('Blog updated successfully');
            return response()->json($blog);
        } catch (\Throwable $e) {
            \Log::error('Blog update failed', ['exception' => $e]);
            return response()->json(['error' => 'Failed to update blog.'], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        \Log::info('Delete method called for blog ID: ' . $id);
        
        $blog = Blog::findOrFail($id);
        \Log::info('Blog found: ' . $blog->title);
        
        $featuredImage = $blog->getOriginal('featured_image');
        $documentationImages = $blog->getOriginal('documentation_images');
        
        \Log::info('Featured image path: ' . (is_array($featuredImage) ? 'ARRAY' : $featuredImage));
        \Log::info('Documentation images path: ' . (is_array($documentationImages) ? 'ARRAY' : $documentationImages));
        
        // Delete featured images (DB may store a directory OR a file path)
        if (!empty($featuredImage) && !is_array($featuredImage) && is_string($featuredImage)) {
            if (str_starts_with($featuredImage, 'blogs/')) {
                Storage::disk('supabase')->delete($featuredImage);
            } else {
                $featuredPath = public_path($featuredImage);
                \Log::info('Featured path: ' . $featuredPath);

                if (is_file($featuredPath)) {
                    File::delete($featuredPath);
                    $parentDir = dirname($featuredPath);
                    if (is_dir($parentDir)) {
                        File::deleteDirectory($parentDir);
                    }
                } elseif (is_dir($featuredPath)) {
                    File::deleteDirectory($featuredPath);
                }
            }
        }

        // Delete documentation images (DB may store a directory OR a file path)
        if (!empty($documentationImages) && !is_array($documentationImages) && is_string($documentationImages)) {
            $decoded = json_decode($documentationImages, true);
            if (is_array($decoded)) {
                foreach ($decoded as $p) {
                    if (is_string($p) && str_starts_with($p, 'blogs/')) {
                        Storage::disk('supabase')->delete($p);
                    }
                }
            } else {
                $docsPath = public_path($documentationImages);
                \Log::info('Docs path: ' . $docsPath);

                if (is_file($docsPath)) {
                    File::delete($docsPath);
                    $parentDir = dirname($docsPath);
                    if (is_dir($parentDir)) {
                        File::deleteDirectory($parentDir);
                    }
                } elseif (is_dir($docsPath)) {
                    File::deleteDirectory($docsPath);
                }
            }
        }
        
        $blog->delete();
        \Log::info('Blog deleted from database');

        return response()->json(null, 204);
    }
}
