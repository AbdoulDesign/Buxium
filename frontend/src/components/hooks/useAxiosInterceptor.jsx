// hooks/useAxiosInterceptor.js
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setupAxiosInterceptors } from "../Api";

const useAxiosInterceptor = () => {
  const navigate = useNavigate(); // Ici on est bien dans le Router
  useEffect(() => {
    setupAxiosInterceptors(navigate);
  }, [navigate]);
};

export default useAxiosInterceptor;
