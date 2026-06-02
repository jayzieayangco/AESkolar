import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signUpWithEmail,
  signInWithGoogle,
  syncUserToDatabase,
  supabase,
} from "../../services/api.js";
import { isValidEmail, getAuthErrorMessage } from "../../utils/validation.js";
import { useAuthSubmitGuard } from "../../hooks/useAuthSubmitGuard.js";

export default function Sign_up() {
  const navigate = useNavigate();
  const { loading, isBlocked, runAuthAction, applyRateLimitCooldown } = useAuthSubmitGuard();
  const [errorMessage, setErrorMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Google OAuth sign-in / registration
  const handleGoogleSignIn = async () => {
    setErrorMessage("");
    const { error } = await runAuthAction(() => signInWithGoogle("/role_selection"));
    if (error) {
      applyRateLimitCooldown(error);
      setErrorMessage(getAuthErrorMessage(error));
    }
  };

  // Listen for authentication state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        await syncUserToDatabase(session, {
          fullName: session.user.user_metadata?.full_name || formData.username,
        });
        await sendConfirmationEmail(session.user.email, session.user);
        navigate("/role_selection");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const sendConfirmationEmail = async (email, user) => {
    try {
      await supabase.functions.invoke(
        "send-welcome-email",
        {
          body: {
            email: email,
            userName: user.user_metadata?.full_name || formData.username || email.split("@")[0],
          },
        }
      );
    } catch (error) {
      console.error("Error calling confirmation handler:", error);
    }
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setEmailError("");

    if (!formData.username.trim()) {
      setErrorMessage("Please enter a username.");
      return;
    }
    if (!isValidEmail(formData.email)) {
      setEmailError("Enter a valid email (e.g. name@school.com).");
      return;
    }
    if (formData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    const { data, error } = await runAuthAction(() =>
      signUpWithEmail(formData.email.trim(), formData.password, {
        full_name: formData.username,
      })
    );

    if (error) {
      applyRateLimitCooldown(error);
      setErrorMessage(getAuthErrorMessage(error));
      return;
    }
    if (data?.session) {
      await syncUserToDatabase(data.session, { fullName: formData.username });
      navigate("/role_selection");
    } else {
      alert("Check your email to confirm your account, then sign in.");
      navigate("/sign_in");
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#cbf0ff] p-6 font-sans select-none overflow-hidden relative">
      
      {/* Main Layout Grid Container */}
      <div className="grid w-full max-w-7xl grid-cols-1 md:grid-cols-2 items-center gap-12 px-4 z-10">
        
        {/* LEFT SIDE SPACER: Keeps grid alignment intact for the background-pinned graphic */}
        <div className="hidden md:block w-full h-full" />

        {/* RIGHT SIDE: Layout alignment node */}
        <div className="flex flex-col items-end w-full relative">
          
          {/* Main Layout Content Box aligning flush against the right-hand edge */}
          <div className="flex flex-col items-end relative">
            
            {/* Header Text - Enlarged to fit Figma proportions exactly */}
            <h1 className="text-7xl font-semibold text-slate-800 tracking-tight mb-8 whitespace-nowrap text-right">
              Create your Account!
            </h1>

            {(errorMessage || emailError) && (
              <p className="text-red-600 text-sm mb-3 w-full text-right font-medium" role="alert">
                {emailError || errorMessage}
              </p>
            )}

            {/* Form Elements Box: Aligns directly underneath the end edge of the header */}
            <form className="space-y-5 w-full max-w-md flex flex-col items-end" onSubmit={handleEmailSignUp}>
              
              {/* Username Input Field */}
              <div className="w-full">
                <label className="block text-lg font-medium text-slate-700 mb-1 pl-2 text-left">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border-2 border-slate-700 bg-[#e3f6ff] px-5 py-4 text-lg text-slate-800 outline-none transition-all focus:border-blue-500 shadow-inner"
                  required
                />
              </div>

              {/* Email Input Field */}
              <div className="w-full">
                <label className="block text-lg font-medium text-slate-700 mb-1 pl-2 text-left">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border-2 border-slate-700 bg-[#e3f6ff] px-5 py-4 text-lg text-slate-800 outline-none transition-all focus:border-blue-500 shadow-inner"
                  required
                />
              </div>

              {/* Password Input Field */}
              <div className="w-full">
                <label className="block text-lg font-medium text-slate-700 mb-1 pl-2 text-left">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border-2 border-slate-700 bg-[#e3f6ff] px-5 py-4 text-lg text-slate-800 outline-none transition-all focus:border-blue-500 shadow-inner"
                  required
                />
              </div>

              {/* Legal Disclaimer Caption Text */}
              <div className="w-full text-center pt-1">
                <span className="text-[13px] font-semibold text-slate-700 tracking-wide">
                  I agree to all Term, Privacy Policy and fees
                </span>
              </div>

              {/* Borderless Sign Up Submit Button */}
              <button
                type="submit"
                disabled={isBlocked}
                className="w-full text-center bg-white text-slate-800 font-bold py-3.5 px-6 rounded-2xl border-none shadow-md text-lg transition-all duration-200 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating account..." : "Sign up"}
              </button>

              {/* Horizontal Split Divider Lines */}
              <div className="flex items-center my-4 w-full">
                <div className="flex-grow border-t-2 border-slate-700"></div>
                <span className="px-4 text-md font-bold text-slate-700 tracking-wide">
                  OR
                </span>
                <div className="flex-grow border-t-2 border-slate-700"></div>
              </div>

              {/* Borderless Google Sign-In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isBlocked}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-5 py-3.5 font-bold text-gray-700 shadow-md border-none transition-all duration-200 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <img
                  src="/google.png"
                  alt="Google logo"
                  className="h-6 w-6 object-contain"
                />
                <span className="text-md">
                  {loading ? "Signing in..." : "Continue with Google"}
                </span>
              </button>
            </form>

          </div>
        </div>
      </div>

      {/* BACKGROUND GRAPHIC ILLUSTRATION - Bottom Left Anchored */}
      <div className="fixed bottom-0 left-0 hidden md:block z-10">
        <img
          src="/signin_pic.png"
          alt="AESkolar Learning Illustration"
          className="max-w-3xl w-[45vw] min-w-[340px] h-auto object-contain drop-shadow-sm"
        />
      </div>

    </div>
  );
}