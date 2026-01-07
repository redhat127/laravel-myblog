<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Post extends Model
{
    /** @use HasFactory<\Database\Factories\PostFactory> */
    use HasFactory, HasUlids, SoftDeletes;

    public function author()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Generate a unique slug from a title
     *
     * @param  string|null  $excludeId  ULID to exclude (for updates)
     */
    public static function generateUniqueSlug(string $title, ?string $excludeId = null): string
    {
        // Generate base slug from title
        $slug = Str::slug($title);
        $originalSlug = $slug;
        $count = 1;

        // Check if slug exists and increment until unique
        while (static::slugExists($slug, $excludeId)) {
            $slug = $originalSlug.'-'.$count;
            $count++;
        }

        return $slug;
    }

    /**
     * Check if a slug exists in the database
     *
     * @param  string|null  $excludeId  ULID to exclude from check
     */
    protected static function slugExists(string $slug, ?string $excludeId = null): bool
    {
        $query = static::withTrashed()->where('slug', $slug);

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->exists();
    }
}
