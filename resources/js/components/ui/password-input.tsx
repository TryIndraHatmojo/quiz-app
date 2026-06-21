import { Eye, EyeOff } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

import { Button } from './button';
import { Input } from './input';

function PasswordInput({
    className,
    disabled,
    ...props
}: Omit<React.ComponentProps<'input'>, 'type'>) {
    const [isVisible, setIsVisible] = React.useState(false);
    const VisibilityIcon = isVisible ? EyeOff : Eye;

    return (
        <div className={cn('relative', className)}>
            <Input
                type={isVisible ? 'text' : 'password'}
                className="pr-10"
                disabled={disabled}
                {...props}
            />
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-1/2 right-0 h-full -translate-y-1/2 px-3 hover:bg-transparent"
                onClick={() => setIsVisible((visible) => !visible)}
                onMouseDown={(event) => event.preventDefault()}
                disabled={disabled}
                aria-label={
                    isVisible ? 'Sembunyikan password' : 'Tampilkan password'
                }
                aria-pressed={isVisible}
            >
                <VisibilityIcon className="h-4 w-4" aria-hidden="true" />
            </Button>
        </div>
    );
}

export { PasswordInput };
