<?php

namespace App\Http\Controllers;

use App\Models\Blog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

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
                $directory = public_path('images/blogs/' . $blog->id);
                if (!is_dir($directory)) {
                    mkdir($directory, 0755, true);
                }
                $file->move($directory, $fileName);
                // Store ONLY directory path in database
                $blog->featured_image = '/images/blogs/' . $blog->id;
                $blog->save();
            }

            // Handle documentation images upload
            if ($request->hasFile('documentation_images')) {
                $docDirectory = public_path('images/docs/' . $blog->id);
                if (!is_dir($docDirectory)) {
                    mkdir($docDirectory, 0755, true);
                }
                foreach ($request->file('documentation_images') as $index => $file) {
                    if ($file && $file->isValid()) {
                        $fileName = time() . '_' . $index . '_' . str_replace(' ', '_', $file->getClientOriginalName());
                        $file->move($docDirectory, $fileName);
                    }
                }
                // Store ONLY directory path in database
                $blog->documentation_images = '/images/docs/' . $blog->id;
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
                    $filePath = public_path($src);
                    if (is_file($filePath)) {
                        File::delete($filePath);
                    }
                }

                $existingDocs = $blog->getOriginal('documentation_images');
                if (!empty($existingDocs) && is_string($existingDocs)) {
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

            // Handle featured image upload
            if ($request->hasFile('featured_image')) {
                \Log::info('Featured image file detected');
                
                // Delete old featured image directory if it exists
                $existingFeatured = $blog->getOriginal('featured_image');
                if (!empty($existingFeatured) && is_string($existingFeatured)) {
                    $existingFeaturedPath = public_path($existingFeatured);
                    \Log::info('Attempting to delete old featured path: ' . $existingFeaturedPath);

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

                $file = $request->file('featured_image');
                $fileName = time() . '_' . str_replace(' ', '_', $file->getClientOriginalName());
                $directory = public_path('images/blogs/' . $blog->id);
                if (!is_dir($directory)) {
                    mkdir($directory, 0755, true);
                }
                $file->move($directory, $fileName);
                $blog->featured_image = '/images/blogs/' . $blog->id;
                $blog->save();
                // Refresh the model to clear any cached accessor values
                $blog->refresh();
                \Log::info('Featured image saved to: ' . $blog->featured_image);
            } else {
                \Log::info('No featured image file detected');
            }

            // Handle documentation images upload
            if ($request->hasFile('documentation_images')) {
                \Log::info('Documentation images files detected');
                
                // Delete old documentation images directory if it exists
                $existingDocs = $blog->getOriginal('documentation_images');
                if (!empty($existingDocs) && is_string($existingDocs)) {
                    $existingDocsPath = public_path($existingDocs);
                    \Log::info('Attempting to delete old docs path: ' . $existingDocsPath);

                    if (is_file($existingDocsPath)) {
                        File::delete($existingDocsPath);
                        $parentDir = dirname($existingDocsPath);
                        if (is_dir($parentDir)) {
                            File::deleteDirectory($parentDir);
                        }
                    } elseif (is_dir($existingDocsPath)) {
                        File::deleteDirectory($existingDocsPath);
                    }
                }

                $docDirectory = public_path('images/docs/' . $blog->id);
                if (!is_dir($docDirectory)) {
                    mkdir($docDirectory, 0755, true);
                }
                foreach ($request->file('documentation_images') as $index => $file) {
                    if ($file && $file->isValid()) {
                        $fileName = time() . '_' . $index . '_' . str_replace(' ', '_', $file->getClientOriginalName());
                        $file->move($docDirectory, $fileName);
                        \Log::info('Documentation image saved: ' . $fileName);
                    }
                }
                // Store ONLY directory path in database
                $blog->documentation_images = '/images/docs/' . $blog->id;
                $blog->save();
                // Refresh the model to clear any cached accessor values
                $blog->refresh();
                \Log::info('Documentation images saved', ['documentation_images' => $blog->getOriginal('documentation_images')]);
            } else {
                \Log::info('No documentation images files detected');
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

        // Delete documentation images (DB may store a directory OR a file path)
        if (!empty($documentationImages) && !is_array($documentationImages) && is_string($documentationImages)) {
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
        
        $blog->delete();
        \Log::info('Blog deleted from database');

        return response()->json(null, 204);
    }
}
