import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

export default function Confirm() {
  const navigate = useNavigate();
  

  useEffect(() => {
    const confirm = async () => {
      const params = new URLSearchParams(window.location.search);

      const token_hash = params.get("token_hash");

      if (!token_hash) return;

      const { error } = await supabase.auth.verifyOtp({
        token_hash,
        type: "email",
      });

      if (!error) {
        navigate("/");
      }
    };

    confirm();
  }, []);

  return <p>Confirming...</p>;
}