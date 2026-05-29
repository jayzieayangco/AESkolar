import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../supabase/client"; 

export default function Sign_in() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Handle Google OAuth sign-in
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const cleanOrigin = window.location.origin.replace(/\/$/, "");
      const dynamicRedirectTarget = `${cleanOrigin}/role_selection`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: dynamicRedirectTarget,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        console.error("Error signing in with Google:", error);
        alert("Error signing in with Google. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Listen for authentication state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
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
            userName: user.user_metadata?.full_name || email.split("@")[0],
          },
        }
      );
    } catch (error) {
      console.error("Error sending confirmation email:", error);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#cbf0ff] p-6 font-sans select-none overflow-hidden relative">
      
      {/* Main Layout Grid Container */}
      <div className="grid w-full max-w-7xl grid-cols-1 md:grid-cols-2 items-center gap-12 px-4 z-10">
        
        {/* LEFT SIDE: Sign In Form Elements */}
        <div className="flex flex-col w-full relative items-start">
          
          {/* Header Typography Group - Matches Big Figma Scaling */}
          <div className="w-full mb-6">
            <h1 className="text-7xl font-semibold text-slate-800 tracking-tight leading-none whitespace-nowrap">
              Welcome Back!
            </h1>
            <p className="text-xl md:text-2xl font-medium text-slate-600 mt-2 pl-1">
              Sign in to continue
            </p>
          </div>

          {/* Core Interactive Form Structure */}
          <form className="space-y-5 w-full max-w-md" onSubmit={(e) => e.preventDefault()}>
            
            {/* Email Input */}
            <div className="w-full">
              <label className="block text-lg font-medium text-slate-700 mb-1 pl-2">
                Email
              </label>
              <input
                type="email"
                className="w-full rounded-2xl border-2 border-slate-700 bg-[#e3f6ff] px-5 py-4 text-lg text-slate-800 outline-none transition-all focus:border-blue-500 shadow-inner"
                required
              />
            </div>

            {/* Password Input */}
            <div className="w-full">
              <label className="block text-lg font-medium text-slate-700 mb-1 pl-2">
                Password
              </label>
              <input
                type="password"
                className="w-full rounded-2xl border-2 border-slate-700 bg-[#e3f6ff] px-5 py-4 text-lg text-slate-800 outline-none transition-all focus:border-blue-500 shadow-inner"
                required
              />
            </div>

            {/* Navigation Redirect Link Trigger */}
            <div className="w-full text-center pt-1">
              <p className="text-base font-medium text-slate-700">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/sign_up")}
                  className="text-[#3b82f6] hover:underline bg-transparent border-none p-0 cursor-pointer font-semibold inline-block"
                >
                  Sign up
                </button>
              </p>
            </div>

            {/* Layout Split Section Splitter */}
            <div className="flex items-center my-4 w-full">
              <div className="flex-grow border-t-2 border-slate-700"></div>
              <span className="px-4 text-md font-bold text-slate-700 tracking-wide">
                OR
              </span>
              <div className="flex-grow border-t-2 border-slate-700"></div>
            </div>

            {/* Google Authentication Portal Integration */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
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

        {/* RIGHT SIDE SPACER: Maintains Layout Consistency */}
        <div className="hidden md:block w-full h-full" />
      </div>

      {/* BACKGROUND GRAPHIC ILLUSTRATION - Bottom Right Anchored */}
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