import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUniversity } from "../university/universityContextValue";
import { supabase } from "../../lib/supabase";
import { setActiveUniversitySlug } from "../../lib/tenantSession";

export default function Confirm() {
  const navigate = useNavigate();
  const { university, path } = useUniversity();

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
        if (university) setActiveUniversitySlug(university.slug);
        navigate(path());
      }
    };

    confirm();
  }, [navigate, path, university]);

  return <p>Confirming...</p>;
}
