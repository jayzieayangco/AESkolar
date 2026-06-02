import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import {

  signInWithEmail,

  signInWithGoogle,

  syncUserToDatabase,

  supabase,

} from "../../services/api.js";

import { isValidEmail, getAuthErrorMessage } from "../../utils/validation.js";
import { useAuthSubmitGuard } from "../../hooks/useAuthSubmitGuard.js";



export default function Sign_in() {

  const navigate = useNavigate();

  const { loading, isBlocked, runAuthAction, applyRateLimitCooldown } = useAuthSubmitGuard();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  const [emailError, setEmailError] = useState("");



  const handleGoogleSignIn = async () => {
    setErrorMessage("");
    const { error } = await runAuthAction(() => signInWithGoogle("/role_selection"));
    if (error) {
      applyRateLimitCooldown(error);
      setErrorMessage(getAuthErrorMessage(error));
    }
  };



  const handleEmailSignIn = async (e) => {

    e?.preventDefault();

    setErrorMessage("");

    setEmailError("");



    if (!isValidEmail(email)) {

      setEmailError("Enter a valid email (e.g. name@school.com).");

      return;

    }

    if (!password) {

      setErrorMessage("Please enter your password.");

      return;

    }



    const { data, error } = await runAuthAction(() =>
      signInWithEmail(email.trim(), password)
    );

    if (error) {
      applyRateLimitCooldown(error);
      setErrorMessage(getAuthErrorMessage(error));
      return;
    }

    if (data?.session) {
      await syncUserToDatabase(data.session);
      navigate("/role_selection");
    }
  };



  useEffect(() => {

    const {

      data: { subscription },

    } = supabase.auth.onAuthStateChange(async (event, session) => {

      if (event === "SIGNED_IN" && session) {

        await syncUserToDatabase(session);

        await sendConfirmationEmail(session.user.email, session.user);

        navigate("/role_selection");

      }

    });

    return () => subscription.unsubscribe();

  }, [navigate]);



  const sendConfirmationEmail = async (emailAddr, user) => {

    try {

      await supabase.functions.invoke("send-welcome-email", {

        body: {

          email: emailAddr,

          userName: user.user_metadata?.full_name || emailAddr.split("@")[0],

        },

      });

    } catch (error) {

      console.error("Error sending confirmation email:", error);

    }

  };



  return (

    <div className="flex h-screen w-full items-center justify-center bg-[#cbf0ff] p-6 font-sans select-none overflow-hidden relative">

      <div className="grid w-full max-w-7xl grid-cols-1 md:grid-cols-2 items-center gap-12 px-4 z-10">

        <div className="flex flex-col w-full relative items-start">

          <div className="w-full mb-6">

            <h1 className="text-7xl font-semibold text-slate-800 tracking-tight leading-none whitespace-nowrap">

              Welcome Back!

            </h1>

            <p className="text-xl md:text-2xl font-medium text-slate-600 mt-2 pl-1">

              Sign in to continue

            </p>

          </div>



          {(errorMessage || emailError) && (

            <p className="text-red-600 text-sm mb-3 max-w-md font-medium" role="alert">

              {emailError || errorMessage}

            </p>

          )}



          <form className="space-y-5 w-full max-w-md" onSubmit={handleEmailSignIn}>

            <div className="w-full">

              <label className="block text-lg font-medium text-slate-700 mb-1 pl-2">

                Email

              </label>

              <input

                type="email"

                value={email}

                onChange={(e) => {

                  setEmail(e.target.value);

                  if (emailError) setEmailError("");

                }}

                onKeyDown={(e) => e.key === "Enter" && handleEmailSignIn(e)}

                className="w-full rounded-2xl border-2 border-slate-700 bg-[#e3f6ff] px-5 py-4 text-lg text-slate-800 outline-none transition-all focus:border-blue-500 shadow-inner"

                required

              />

            </div>



            <div className="w-full">

              <label className="block text-lg font-medium text-slate-700 mb-1 pl-2">

                Password

              </label>

              <input

                type="password"

                value={password}

                onChange={(e) => setPassword(e.target.value)}

                onKeyDown={(e) => e.key === "Enter" && handleEmailSignIn(e)}

                className="w-full rounded-2xl border-2 border-slate-700 bg-[#e3f6ff] px-5 py-4 text-lg text-slate-800 outline-none transition-all focus:border-blue-500 shadow-inner"

                required

              />

            </div>



            <button

              type="submit"

              disabled={isBlocked}

              className="w-full rounded-2xl bg-slate-800 text-white py-3.5 font-bold shadow-md transition-all hover:bg-slate-700 disabled:opacity-50 cursor-pointer"

            >

              {loading ? "Signing in..." : "Sign in"}

            </button>



            <div className="w-full text-center pt-1">

              <p className="text-base font-medium text-slate-700">

                Don&apos;t have an account?{" "}

                <button

                  type="button"

                  onClick={() => navigate("/sign_up")}

                  className="text-[#3b82f6] hover:underline bg-transparent border-none p-0 cursor-pointer font-semibold inline-block"

                >

                  Sign up

                </button>

              </p>

            </div>



            <div className="flex items-center my-4 w-full">

              <div className="flex-grow border-t-2 border-slate-700"></div>

              <span className="px-4 text-md font-bold text-slate-700 tracking-wide">OR</span>

              <div className="flex-grow border-t-2 border-slate-700"></div>

            </div>



            <button

              type="button"

              onClick={handleGoogleSignIn}

              disabled={isBlocked}

              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-5 py-3.5 font-bold text-gray-700 shadow-md border-none transition-all duration-200 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"

            >

              <img src="/google.png" alt="Google logo" className="h-6 w-6 object-contain" />

              <span className="text-md">

                {loading ? "Signing in..." : "Continue with Google"}

              </span>

            </button>

          </form>

        </div>

        <div className="hidden md:block w-full h-full" />

      </div>



      <div className="fixed bottom-0 right-0 hidden md:block z-10">

        <img

          src="/signin_pic.png"

          alt="AESkolar Learning Illustration"

          className="max-w-3xl w-[45vw] min-w-[340px] h-auto object-contain drop-shadow-sm"

        />

      </div>

    </div>

  );

}


