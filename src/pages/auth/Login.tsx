import { useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Loader2, LogIn, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { useLogin } from "@/hooks/use-finance";
import { getApiError, USE_MOCK } from "@/lib/api";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/demo";

const loginSchema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginPage() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { redirect?: string };
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm<LoginForm>({ defaultValues: { email: "", password: "" } });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof LoginForm;
        setError(field, { message: issue.message });
      }
      return;
    }
    try {
      await login.mutateAsync(parsed.data);
      toast.success("Selamat datang kembali!");
      const redirect =
        search.redirect?.startsWith("/") && !search.redirect.startsWith("//")
          ? search.redirect
          : "/";
      navigate({ href: redirect, replace: true });
    } catch (error) {
      const apiError = getApiError(error);
      if (apiError.fields) {
        for (const field of apiError.fields) {
          setError(field.path as keyof LoginForm, { message: field.message });
        }
      }
      setFormError(apiError.message);
    }
  });

  return (
    <Card className='gap-5 rounded-3xl border-0 px-5 py-6 ring-1 ring-border/50'>
      <div className='flex flex-col gap-1'>
        <span className='flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
          <LogIn size={21} />
        </span>
        <h1 className='mt-2 text-2xl font-bold tracking-tight'>Masuk ke Duitku</h1>
        <p className='text-xs leading-relaxed text-muted-foreground'>
          Lanjutkan memantau pemasukan, pengeluaran, dan anggaranmu.
        </p>
      </div>

      <form onSubmit={onSubmit} className='flex flex-col gap-4' noValidate>
        <div className='flex flex-col gap-2'>
          <Label htmlFor='email'>Email</Label>
          <Input
            id='email'
            type='email'
            autoComplete='email'
            placeholder='nama@email.com'
            inputMode='email'
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
          <FieldError errors={[errors.email]} />
        </div>

        <div className='flex flex-col gap-2'>
          <Label htmlFor='password'>Password</Label>
          <div className='relative'>
            <Input
              id='password'
              type={showPassword ? "text" : "password"}
              autoComplete='current-password'
              placeholder='Minimal 8 karakter'
              className='pr-11'
              aria-invalid={Boolean(errors.password)}
              {...register("password")}
            />
            <button
              type='button'
              onClick={() => setShowPassword((current) => !current)}
              className='absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground'
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          <FieldError errors={[errors.password]} />
        </div>

        {formError && (
          <p className='rounded-xl bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive'>
            {formError}
          </p>
        )}

        <Button type='submit' className='h-11 rounded-xl' disabled={login.isPending}>
          {login.isPending ? (
            <>
              <Loader2 size={16} className='animate-spin' />
              Memproses...
            </>
          ) : (
            "Masuk"
          )}
        </Button>
      </form>

      {USE_MOCK && (
        <div className='rounded-2xl bg-surface-container-low p-3.5'>
          <div className='flex items-center gap-1.5 text-[11px] font-semibold text-primary'>
            <Sparkles size={13} />
            Mode demo aktif
          </div>
          <p className='mt-1 text-[11px] leading-relaxed text-muted-foreground'>
            Masuk dengan <span className='font-semibold text-foreground'>{DEMO_EMAIL}</span> /{" "}
            <span className='font-semibold text-foreground'>{DEMO_PASSWORD}</span>
          </p>
          <button
            type='button'
            onClick={() => {
              setValue("email", DEMO_EMAIL);
              setValue("password", DEMO_PASSWORD);
            }}
            className='mt-2 text-[11px] font-semibold text-primary hover:underline'
          >
            Isi otomatis kredensial demo
          </button>
        </div>
      )}

      <p className='text-center text-xs text-muted-foreground'>
        Belum punya akun?{" "}
        <Link
          to='/daftar'
          search={{ redirect: search.redirect }}
          className='font-semibold text-primary hover:underline'
        >
          Daftar sekarang
        </Link>
      </p>
    </Card>
  );
}

export default LoginPage;
