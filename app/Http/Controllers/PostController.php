<?php

namespace App\Http\Controllers;

use App\Http\Resources\PostResource;
use App\Models\Post;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Intervention\Image\Laravel\Facades\Image;

class PostController extends Controller
{
    public function all()
    {
        return inertia('post/all');
    }

    public function create()
    {
        $title = 'Untitled Post';

        $post = Auth::user()->posts()->create([
            'title' => $title,
            'slug' => Post::generateUniqueSlug($title),
            'status' => 'draft',
        ]);

        return redirect()->route('post.edit', [
            'postId' => $post->id,
        ])->with('flashMessage', [
            'type' => 'success',
            'text' => 'Post has been created. you can now update it.',
        ]);
    }

    public function edit(string $postId)
    {
        $post = Post::findOrFail($postId);

        if ($post->user_id !== Auth::id()) {
            abort(404);
        }

        return inertia('post/edit', [
            'post' => PostResource::make($post),
        ]);
    }

    public function update(string $postId)
    {
        $post = Post::findOrFail($postId);

        if ($post->user_id !== Auth::id()) {
            abort(404);
        }

        $validated = request()->validate([
            'title' => ['bail', 'nullable', 'string', 'min:10', 'max:100'],
            'excerpt' => ['bail', 'nullable', 'string', 'max:300'],
            'body' => ['bail', 'nullable', 'string', 'min:100', 'max:10000'],
            'status' => ['bail', 'required', 'string', Rule::in('draft', 'published', 'scheduled')],
            'publish_date' => [
                'bail',
                'nullable',
                'date',
                'after_or_equal:today',
                function ($attribute, $value, $fail) {
                    if (request()->input('status') === 'scheduled' && empty($value)) {
                        $fail('publish date is required when status is scheduled.');
                    }
                },
            ],
        ]);

        $post->update($validated);

        return back()->with('flashMessage', [
            'type' => 'success',
            'text' => 'Post has been updated.',
        ]);
    }

    public function uploadFeaturedImage(string $postId)
    {
        $post = Post::findOrFail($postId);

        if ($post->user_id !== Auth::id()) {
            abort(404);
        }

        request()->validate([
            'file' => [
                'bail',
                'required',
                Rule::file()
                    ->image(allowSvg: false)
                    ->min('1kb')
                    ->max('5mb'),
            ],
        ]);

        $file = request()->file('file');

        try {
            $image = Image::read($file)
                ->cover(1200, 630)
                ->toWebp(80);
        } catch (\Exception $e) {
            logger()->error('Featured image processing failed', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to process image. try a different file.',
            ], 422);
        }

        $user = Auth::user();

        $path = 'post/featured_image/'.$user->id.'_'.time().'_'.Str::random(8).'.webp';

        Storage::put($path, $image->toString());

        $prevFeaturedImagePath = $post->featured_image_path;

        $post->update([
            'featured_image_path' => $path,
        ]);

        if ($prevFeaturedImagePath && Storage::exists($prevFeaturedImagePath)) {
            Storage::delete($prevFeaturedImagePath);
        }

        return response()->json([
            'url' => Storage::url($path),
        ]);
    }

    public function deleteFeaturedImage(string $postId)
    {
        $post = Post::findOrFail($postId);

        if ($post->user_id !== Auth::id()) {
            abort(404);
        }

        $prevFeaturedImagePath = $post->featured_image_path;

        $post->update([
            'featured_image_path' => null,
        ]);

        if ($prevFeaturedImagePath && Storage::exists($prevFeaturedImagePath)) {
            Storage::delete($prevFeaturedImagePath);
        }

        return back();
    }
}
