import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, ChefHat } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { registerSchema, type RegisterFormData } from "../types/auth";

export const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const { register: registerUser, isLoading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data.name, data.email, data.password);
      toast.success("Registration successful!");
      navigate("/");
    } catch (error) {
      // Error is handled by the auth context
      console.error("Registration failed:", error);
    }
  };

  return React.createElement(
    "div",
    {
      className:
        "min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8",
    },
    React.createElement(
      "div",
      { className: "max-w-md w-full space-y-8" },
      React.createElement(
        "div",
        null,
        React.createElement(
          "div",
          {
            className:
              "mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-orange-100",
          },
          React.createElement(ChefHat, { className: "h-6 w-6 text-orange-600" })
        ),
        React.createElement(
          "h2",
          {
            className: "mt-6 text-center text-3xl font-extrabold text-gray-900",
          },
          "Create your account"
        ),
        React.createElement(
          "p",
          { className: "mt-2 text-center text-sm text-gray-600" },
          "Or ",
          React.createElement(
            Link,
            {
              to: "/login",
              className: "font-medium text-orange-600 hover:text-orange-500",
            },
            "sign in to your existing account"
          )
        )
      ),

      React.createElement(
        "form",
        { className: "mt-8 space-y-6", onSubmit: handleSubmit(onSubmit) },
        React.createElement(
          "div",
          { className: "space-y-4" },
          // Name field
          React.createElement(
            "div",
            null,
            React.createElement(
              "label",
              {
                htmlFor: "name",
                className: "block text-sm font-medium text-gray-700",
              },
              "Full name"
            ),
            React.createElement("input", {
              id: "name",
              type: "text",
              autoComplete: "name",
              className:
                "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500",
              ...register("name"),
            }),
            errors.name &&
              React.createElement(
                "p",
                { className: "mt-1 text-sm text-red-600" },
                errors.name.message
              )
          ),

          // Email field
          React.createElement(
            "div",
            null,
            React.createElement(
              "label",
              {
                htmlFor: "email",
                className: "block text-sm font-medium text-gray-700",
              },
              "Email address"
            ),
            React.createElement("input", {
              id: "email",
              type: "email",
              autoComplete: "email",
              className:
                "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500",
              ...register("email"),
            }),
            errors.email &&
              React.createElement(
                "p",
                { className: "mt-1 text-sm text-red-600" },
                errors.email.message
              )
          ),

          // Password field
          React.createElement(
            "div",
            null,
            React.createElement(
              "label",
              {
                htmlFor: "password",
                className: "block text-sm font-medium text-gray-700",
              },
              "Password"
            ),
            React.createElement(
              "div",
              { className: "mt-1 relative" },
              React.createElement("input", {
                id: "password",
                type: showPassword ? "text" : "password",
                autoComplete: "new-password",
                className:
                  "block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500",
                ...register("password"),
              }),
              React.createElement(
                "button",
                {
                  type: "button",
                  className:
                    "absolute inset-y-0 right-0 pr-3 flex items-center",
                  onClick: () => setShowPassword(!showPassword),
                },
                showPassword
                  ? React.createElement(EyeOff, {
                      className: "h-5 w-5 text-gray-400",
                    })
                  : React.createElement(Eye, {
                      className: "h-5 w-5 text-gray-400",
                    })
              )
            ),
            errors.password &&
              React.createElement(
                "p",
                { className: "mt-1 text-sm text-red-600" },
                errors.password.message
              )
          ),

          // Confirm Password field
          React.createElement(
            "div",
            null,
            React.createElement(
              "label",
              {
                htmlFor: "confirmPassword",
                className: "block text-sm font-medium text-gray-700",
              },
              "Confirm password"
            ),
            React.createElement(
              "div",
              { className: "mt-1 relative" },
              React.createElement("input", {
                id: "confirmPassword",
                type: showConfirmPassword ? "text" : "password",
                autoComplete: "new-password",
                className:
                  "block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500",
                ...register("confirmPassword"),
              }),
              React.createElement(
                "button",
                {
                  type: "button",
                  className:
                    "absolute inset-y-0 right-0 pr-3 flex items-center",
                  onClick: () => setShowConfirmPassword(!showConfirmPassword),
                },
                showConfirmPassword
                  ? React.createElement(EyeOff, {
                      className: "h-5 w-5 text-gray-400",
                    })
                  : React.createElement(Eye, {
                      className: "h-5 w-5 text-gray-400",
                    })
              )
            ),
            errors.confirmPassword &&
              React.createElement(
                "p",
                { className: "mt-1 text-sm text-red-600" },
                errors.confirmPassword.message
              )
          )
        ),

        React.createElement(
          "div",
          null,
          React.createElement(
            "button",
            {
              type: "submit",
              disabled: isLoading,
              className:
                "group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed",
            },
            isLoading ? "Creating account..." : "Create account"
          )
        )
      )
    )
  );
};

export default RegisterPage;
