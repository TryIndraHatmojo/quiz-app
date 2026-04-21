<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $user = $request->user();
        $navGroups = [];

        if ($user) {
            $user->load('roles.menus');
            $menuIds = $user->roles->flatMap->menus->pluck('id')->unique();
            
            $menus = \App\Models\Menu::whereIn('id', $menuIds)
                ->where('is_active', true)
                ->orderBy('order')
                ->get();
                
            $grouped = $menus->groupBy('group_name');
            foreach ($grouped as $groupName => $groupMenus) {
                $items = [];
                // first handle parents
                $parents = $groupMenus->where('parent_id', null);
                foreach ($parents as $parent) {
                    $children = $groupMenus->where('parent_id', $parent->id);
                    $item = [
                        'title' => $parent->title,
                        'href' => $parent->url ?? '#',
                        'icon' => $parent->icon,
                    ];
                    if ($children->count() > 0) {
                        $item['items'] = $children->map(function($child) {
                            return [
                                'title' => $child->title,
                                'href' => $child->url,
                                'icon' => $child->icon,
                            ];
                        })->values()->toArray();
                    }
                    $items[] = $item;
                }
                
                if (count($items) > 0) {
                    $navGroups[] = [
                        'title' => $groupName,
                        'items' => $items,
                    ];
                }
            }
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $user,
            ],
            'navGroups' => $navGroups,
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
