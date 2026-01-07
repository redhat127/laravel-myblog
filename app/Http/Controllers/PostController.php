<?php

namespace App\Http\Controllers;

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
        return inertia('post/create');
    }

    public function store()
    {
        $validated = request()->validate([
            'title' => ['bail', 'required', 'string', 'min:10', 'max:100'],
            'excerpt' => ['bail', 'nullable', 'string', 'max:300'],
            'body' => ['bail', 'required', 'string', 'min:100', 'max:10000'],
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
            'featured_image' => ['bail', 'nullable', 'string'],
        ]);

        Auth::user()->posts()->create($validated);

        return redirect()->route('post.all')->with('flashMessage', [
            'type' => 'success',
            'text' => 'Post has been created.',
        ]);
    }

    public function uploadFeaturedImage()
    {
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
                ->cover(300, 300)
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

        return response()->json([
            'path' => $path,
        ]);
    }
}
