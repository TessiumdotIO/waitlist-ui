import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import ParticleBackground from "@/components/ParticleBackground";
import { FadeIn } from "@/components/Animations";

const NotFound = () => {
	const location = useLocation();

	useEffect(() => {
		console.error(
			"404 Error: User attempted to access non-existent route:",
			location.pathname
		);
	}, [location.pathname]);

	return (
		<div className="relative min-h-screen flex items-center justify-center overflow-hidden">
			<ParticleBackground />

			<div className="relative z-10 max-w-md text-center px-6">
				<FadeIn>
					<h1 className="text-9xl font-bold mb-4 text-primary font-display tracking-tight">
						404
					</h1>
					<div className="glass-effect px-8 py-10 rounded-2xl">
						<p className="text-2xl mb-6 font-medium">
							Page not found
						</p>
						<p className="text-muted-foreground mb-8">
							The page you are looking for might have been
							removed, had its name changed, or is temporarily
							unavailable.
						</p>

						<a
							href="/"
							className="inline-block bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-6 rounded-lg transition-colors duration-300 shadow-lg hover:shadow-primary/25"
						>
							Return to Home
						</a>
					</div>
				</FadeIn>
			</div>
		</div>
	);
};

export default NotFound;
