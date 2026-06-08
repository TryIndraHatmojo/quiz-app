import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { store } from '@/routes/login';
import { Form, Head, useForm } from '@inertiajs/react';
import { KeyRound } from 'lucide-react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
}

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: LoginProps) {
    const resetForm = useForm({
        identifier: '',
        password: '',
        password_confirmation: '',
    });

    const submitResetRequest = (e: React.FormEvent) => {
        e.preventDefault();
        resetForm.post(route('password-reset-requests.store'), {
            preserveScroll: true,
            onSuccess: () => resetForm.reset(),
        });
    };

    return (
        <AuthLayout
            title="Masuk ke akun Anda"
            description="Masukkan email atau nomor induk siswa untuk masuk"
        >
            <Head title="Log in" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email atau NIS</Label>
                                <Input
                                    id="email"
                                    type="text"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="username"
                                    placeholder="email@example.com atau 20260001"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Password"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                />
                                <Label htmlFor="remember">Remember me</Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 w-full"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                Masuk
                            </Button>
                        </div>
                    </>
                )}
            </Form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            {canResetPassword && (
                <form
                    onSubmit={submitResetRequest}
                    className="mt-8 space-y-4 border-t pt-6"
                >
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
            )}
        </AuthLayout>
    );
}
