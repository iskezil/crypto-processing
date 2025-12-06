import { VisitOptions } from '@inertiajs/inertia'

import { useMemo, useCallback } from 'react';
import { router as inertiaRouter } from '@inertiajs/react';
import NProgress from 'nprogress';
import { isEqualPath } from 'minimal-shared/utils';

// ----------------------------------------------------------------------

/**
 * Customized useRouter hook with NProgress integration.
 */

export function useRouter() {
    const push = useCallback((href: string, options: VisitOptions = {} ) => {
        if (!isEqualPath(href, window.location.href, { deep: false })) {
            NProgress.start();
        }

        inertiaRouter.visit(href, {
            method: 'get',
            replace: false,
            preserveScroll: false,
            preserveState: false,
            ...options,
            onFinish: () => {
                NProgress.done();
                options.onFinish?.();
            },
        });
    }, []);

    const replace = useCallback((href: string, options = {}) => {
        if (!isEqualPath(href, window.location.href, { deep: false })) {
            NProgress.start();
        }

        inertiaRouter.visit(href, {
            method: 'get',
            replace: true,
            preserveScroll: false,
            preserveState: false,
            ...options,
            onFinish: () => {
                NProgress.done();
                options.onFinish?.();
            },
        });
    }, []);

    const router = useMemo(
        () => ({
            push,
            replace,
            back: () => window.history.back(),
            forward: () => window.history.forward(),
            refresh: () => inertiaRouter.reload(),
        }),
        [push, replace]
    );

    return router;
}
