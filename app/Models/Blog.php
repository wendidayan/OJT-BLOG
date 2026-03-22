<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Blog extends Model
{
    use HasFactory;

    protected $casts = [
        'date_from' => 'date',
        'date_to' => 'date',
    ];

    protected $fillable = [
        'title',
        'content',
        'task',
        'week',
        'date_from',
        'date_to',
        'read_time',
        'featured_image',
        'documentation_images',
    ];

    /**
     * Get documentation images as array (handles both directory paths and JSON arrays)
     */
    public function getDocumentationImagesAttribute($value)
    {
        if (empty($value)) {
            return [];
        }

        // If it's already an array (from JSON), return as is
        if (is_array($value)) {
            return $value;
        }

        // If it's a directory path (new format), scan the directory
        if (is_string($value) && !str_contains($value, '[')) {
            $directory = public_path($value);
            if (is_dir($directory)) {
                $files = scandir($directory);
                $imageFiles = [];
                foreach ($files as $file) {
                    if ($file !== '.' && $file !== '..') {
                        $imageFiles[] = $value . '/' . $file;
                    }
                }
                return $imageFiles;
            }
            return [];
        }

        // If it's a JSON string (legacy format), decode it
        if (is_string($value)) {
            $decoded = json_decode($value, true);
            return is_array($decoded) ? $decoded : [];
        }

        return [];
    }

    /**
     * Set documentation images attribute (prevents array from being saved)
     */
    public function setDocumentationImagesAttribute($value)
    {
        // Don't allow arrays to be set directly
        // This should only be set as a string (directory path)
        if (is_array($value)) {
            return; // Don't save arrays
        }
        $this->attributes['documentation_images'] = $value;
    }

    /**
     * Get featured image URL (handles both directory paths and direct URLs)
     */
    public function getFeaturedImageAttribute($value)
    {
        if (empty($value)) {
            return null;
        }

        // If it's a directory path, find the first image in that directory
        if (is_string($value) && !str_contains($value, '.') && !str_contains($value, 'http')) {
            $directory = public_path($value);
            if (is_dir($directory)) {
                $files = scandir($directory);
                foreach ($files as $file) {
                    if ($file !== '.' && $file !== '..') {
                        return $value . '/' . $file;
                    }
                }
            }
            return $value;
        }

        return $value;
    }

    /**
     * Set featured image attribute (prevents array from being saved)
     */
    public function setFeaturedImageAttribute($value)
    {
        // Don't allow arrays to be set directly
        // This should only be set as a string (directory path or URL)
        if (is_array($value)) {
            return; // Don't save arrays
        }
        $this->attributes['featured_image'] = $value;
    }
}