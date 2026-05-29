import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../supabase/client"; 

export default function Sign_up() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
        console.error("Error signing up with Google:", error);
        alert("Error registering with Google. Please try again.");
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
            userName: user.user_metadata?.full_name || formData.username || email.split("@")[0],
          },
        }
      );
    } catch (error) {
      console.error("Error calling confirmation handler:", error);
    }
  };

  const handleEmailSignUp = (e) => {
    e.preventDefault();
    alert("Signing up with credentials...");
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
                className="w-full text-center bg-white text-slate-800 font-bold py-3.5 px-6 rounded-2xl border-none shadow-md text-lg transition-all duration-200 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                Sign up
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