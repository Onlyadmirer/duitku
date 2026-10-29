import { useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { useRegister } from "@/hooks/use-finance";
import { getApiError } from "@/lib/api";

const registerSchema = z
  .object({
    name: z.string().min(2, "Nama minimal 2 karakter"),
    email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
    password: z.string().min(8, "Password minimal 8 karakter"),
    confirmPassword: z.string().min(8, "Konfirmasi password minimal 8 karakter"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Konfirmasi password tidak sama",
  });

type RegisterForm = z.infer<typeof registerSchema>;

function RegisterPage() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { redirect?: string };
  const registerMutation = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterForm>({
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof RegisterForm;
        setError(field, { message: issue.message });
      }
      return;
    }
    try {
      await registerMutation.mutateAsync({
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
      });
      toast.success("Akun berhasil dibuat. Selamat bergabung!");
      const redirect =
        search.redirect?.startsWith("/") && !search.redirect.startsWith("//")
          ? search.redirect
          : "/";
      navigate({ href: redirect, replace: true });
    } catch (error) {
      const apiError = getApiError(error);
      if (apiError.fields) {
        for (const field of apiError.fields) {
          setError(field.path as keyof RegisterForm, { message: field.message });
        }
      }
      setFormError(apiError.message);
    }
  });

  return (
    <Card className='gap-5 rounded-3xl border-0 px-5 py-6 ring-1 ring-border/50'>
      <div className='flex flex-col gap-1'>
        <span className='flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
          <UserPlus size={21} />
        </span>
        <h1 className='mt-2 text-2xl font-bold tracking-tight'>Buat akun baru</h1>
        <p className='text-xs leading-relaxed text-muted-foreground'>
          Mulai rapikan keuanganmu dalam satu tempat.
        </p>
      </div>

      <form onSubmit={onSubmit} className='flex flex-col gap-4' noValidate>
        <div className='flex flex-col gap-2'>
          <Label htmlFor='name'>Nama lengkap</Label>
          <Input
            id='name'
            autoComplete='name'
            placeholder='Nama kamu'
            aria-invalid={Boolean(errors.name)}
            {...register("name")}
          />
          <FieldError errors={[errors.name]} />
        </div>

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
              autoComplete='new-password'
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

        <div className='flex flex-col gap-2'>
          <Label htmlFor='confirmPassword'>Konfirmasi password</Label>
          <Input
            id='confirmPassword'
            type={showPassword ? "text" : "password"}
            autoComplete='new-password'
            placeholder='Ulangi password'
            aria-invalid={Boolean(errors.confirmPassword)}
            {...register("confirmPassword")}
          />
          <FieldError errors={[errors.confirmPassword]} />
        </div>

        {formError && (
          <p className='rounded-xl bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive'>
            {formError}
          </p>
        )}

        <Button
          type='submit'
          className='h-11 rounded-xl'
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? (
            <>
              <Loader2 size={16} className='animate-spin' />
              Membuat akun...
            </>
          ) : (
            "Daftar"
          )}
        </Button>
      </form>

      <p className='text-center text-xs text-muted-foreground'>
        Sudah punya akun?{" "}
        <Link
          to='/masuk'
          search={{ redirect: search.redirect }}
          className='font-semibold text-primary hover:underline'
        >
          Masuk
        </Link>
      </p>
    </Card>
  );
}

export default RegisterPage;
