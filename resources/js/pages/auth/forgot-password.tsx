import { login } from '@/routes';
import { store } from '@/routes/password-reset-requests';
import { Head, useForm } from '@inertiajs/react';
import { KeyRound } from 'lucide-react';
import type { FormEvent } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';

export default function ForgotPassword({ status }: { status?: string }) {
    const resetForm = useForm({
        identifier: '',
        password: '',
        password_confirmation: '',
    });

    const submitResetRequest = (e: FormEvent) => {
        e.preventDefault();

        resetForm.post(store.url(), {
            preserveScroll: true,
            onSuccess: () => resetForm.reset(),
        });
    };

    return (
        <AuthLayout
            title="Lupa Password"
            description="Ajukan password baru untuk disetujui oleh admin"
        >
            <Head title="Lupa Password" />

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <div className="space-y-6">
                <form onSubmit={submitResetRequest} className="space-y-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                            <KeyRound className="h-4 w-4" />
                            Ajukan Reset Password
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Pengajuan akan masuk ke admin untuk disetujui.
                        </p>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="reset-identifier">Email atau NIS</Label>
                        <Input
                            id="reset-identifier"
                            type="text"
                            value={resetForm.data.identifier}
                            onChange={(e) =>
                                resetForm.setData('identifier', e.target.value)
                            }
                            autoComplete="username"
                            autoFocus
                            placeholder="email@example.com atau 20260001"
                        />
                        <InputError message={resetForm.errors.identifier} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="reset-password">Password Baru</Label>
                        <Input
                            id="reset-password"
                            type="password"
                            value={resetForm.data.password}
                            onChange={(e) =>
                                resetForm.setData('password', e.target.value)
                            }
                            autoComplete="new-password"
                            placeholder="Minimal 8 karakter"
                        />
                        <InputError message={resetForm.errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="reset-password-confirmation">
                            Konfirmasi Password Baru
                        </Label>
                        <Input
                            id="reset-password-confirmation"
                            type="password"
                            value={resetForm.data.password_confirmation}
                            onChange={(e) =>
                                resetForm.setData(
                                    'password_confirmation',
                                    e.target.value,
                                )
                            }
                            autoComplete="new-password"
                            placeholder="Ulangi password baru"
                        />
                        <InputError
                            message={resetForm.errors.password_confirmation}
                        />
                    </div>

                    <Button
                        type="submit"
                        variant="secondary"
                        className="w-full"
                        disabled={resetForm.processing}
                    >
                        {resetForm.processing && <Spinner />}
                        Kirim Pengajuan
                    </Button>
                </form>

                <div className="space-x-1 text-center text-sm text-muted-foreground">
                    <span>Atau, kembali ke</span>
                    <TextLink href={login()}>log in</TextLink>
                </div>
            </div>
        </AuthLayout>
    );
}
