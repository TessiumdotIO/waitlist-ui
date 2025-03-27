import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const NavBar: React.FC = () => {
	const [scrolled, setScrolled] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const scrollToWaitlist = () => {
		const featuresElement = document.getElementById("waitlist");
		if (featuresElement) {
			featuresElement.scrollIntoView({ behavior: "smooth" });
		}
	};
	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 10);
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<header
			className={cn(
				"fixed top-0 left-0 right-0 z-50 px-6 lg:px-10 transition-all duration-300 py-4",
				scrolled
					? "backdrop-blur-md bg-background/80 shadow-sm"
					: "bg-transparent"
			)}
		>
			<div className="max-w-7xl mx-auto flex items-center justify-between">
				<div className="flex items-center gap-2">
					<div className="flex items-center text-primary">
						<img
							src="/logo.PNG"
							className="h-5 w-5 m-1"
							alt="LOGO"
						/>
						<span className="text-primary font-bold text-2xl font-display">
							Tessium
						</span>
					</div>
				</div>

				{/* Desktop navigation */}
				<nav className="hidden md:flex items-center space-x-6">
					{/* <a
						href="#features"
						className="subtle-underline font-medium"
					>
						Features
					</a>
					<a
						href="#how-it-works"
						className="subtle-underline font-medium"
					>
						How It Works
					</a> */}
					{/* <a href="#about" className="subtle-underline font-medium">About</a> */}
				</nav>

				<div className="hidden md:flex items-center space-x-4">
					{/* <Button
						className="bg-primary/10 text-primary hover:bg-primary/20 disabled"
						variant="ghost"
						onClick={scrollToWaitlist}
					>
						Login
					</Button> */}
					<Button
						variant="default"
						onClick={scrollToWaitlist}
						className="px-6"
					>
						Join Waitlist
					</Button>
				</div>

				{/* Mobile menu button */}
				<button
					className="md:hidden focus:outline-none"
					onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
					aria-label="Toggle menu"
				>
					<div className="relative w-6 h-5">
						<span
							className={cn(
								"absolute h-0.5 w-6 bg-foreground transition-all duration-300",
								mobileMenuOpen ? "top-2 rotate-45" : "top-0"
							)}
						/>
						<span
							className={cn(
								"absolute h-0.5 w-6 bg-foreground top-2 transition-all duration-300",
								mobileMenuOpen ? "opacity-0" : "opacity-100"
							)}
						/>
						<span
							className={cn(
								"absolute h-0.5 w-6 bg-foreground transition-all duration-300",
								mobileMenuOpen ? "top-2 -rotate-45" : "top-4"
							)}
						/>
					</div>
				</button>
			</div>

			{/* Mobile navigation */}
			<div
				className={cn(
					"md:hidden fixed inset-x-0 bg-background/95 backdrop-blur-md transition-all duration-300 overflow-hidden",
					mobileMenuOpen
						? "top-[60px] h-auto shadow-md pb-6"
						: "top-[60px] h-0"
				)}
			>
				<div className="flex flex-col space-y-4 px-6 py-4">
					{/* <a
						href="#features"
						className="py-2 px-4 hover:bg-muted rounded-md transition-colors"
						onClick={() => setMobileMenuOpen(false)}
					>
						Features
					</a>
					<a
						href="#how-it-works"
						className="py-2 px-4 hover:bg-muted rounded-md transition-colors"
						onClick={() => setMobileMenuOpen(false)}
					>
						How It Works
					</a> */}
					{/* <a 
            href="#about" 
            className="py-2 px-4 hover:bg-muted rounded-md transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            About
          </a> */}
					<div className="pt-2 flex flex-col space-y-3">
						{/* <Button
							variant="outline"
							className="w-full justify-center disabled"
							onClick={scrollToWaitlist}
						>
							Login
						</Button> */}
						<Button
							variant="default"
							className="w-full justify-center"
							onClick={scrollToWaitlist}
						>
							Join Waitlist
						</Button>
					</div>
				</div>
			</div>
		</header>
	);
};

export default NavBar;
