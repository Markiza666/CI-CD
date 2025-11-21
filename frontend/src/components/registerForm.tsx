import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";

const RegisterForm: React.FC = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState("");
	const [error, setError] = useState<string | null>(null);

	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (password.length < 8) {
			setError("Password must be at least 8 characters long.");
			return;
		}
		if (!name.trim()) {
			setError("Name is required.");
			return;
		}

		try {
			const response = await apiClient.post("/auth/register", {
				email,
				password,
				name,
			});

			if (response.status === 201 || response.status === 200) {
				console.log("Registration successful:", response.data);
				// 🔹 Skicka användaren till login-sidan med en flagga
				navigate("/login", { state: { registered: true } });
			}
		} catch (err: any) {
			const msg =
				err.response?.data?.error || "Registration failed. Please try again.";
			setError(msg);
		}
	};

	return (
		<div className="form-container">
			<h2 className="form-title">Register Account</h2>

			{error && (
				<p className="error-message" role="alert">
					{error}
				</p>
			)}

			<form onSubmit={handleSubmit} className="form-layout">
				<div className="input-group">
					<label htmlFor="register-email" className="input-label">
						Email:
					</label>
					<input
						id="register-email"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						className="input-field"
						autoComplete="email"
						placeholder="e.g., anna.developer@mail.com"
					/>
				</div>

				<div className="input-group">
					<label htmlFor="register-name" className="input-label">
						Name:
					</label>
					<input
						id="register-name"
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						required
						className="input-field"
						autoComplete="name"
						placeholder="Your full name"
					/>
				</div>

				<div className="input-group">
					<label htmlFor="register-password" className="input-label">
						Password (min 8 characters):
					</label>
					<input
						id="register-password"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						className="input-field"
						autoComplete="new-password"
						placeholder="Min. 8 characters"
					/>
				</div>

				<button type="submit" className="submit-button">
					Register Account
				</button>
			</form>
		</div>
	);
};

export default RegisterForm;
