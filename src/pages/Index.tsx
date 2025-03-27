import React, { useEffect } from "react";
import NavBar from "@/components/NavBar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import WaitlistForm from "@/components/WaitlistForm";
import Footer from "@/components/Footer";

const Index = () => {
	// Smooth scroll implementation
	useEffect(() => {
		const handleAnchorClick = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			if (
				target.tagName === "A" &&
				target.getAttribute("href")?.startsWith("#")
			) {
				const id = target.getAttribute("href")?.substring(1);
				if (!id) return;

				const element = document.getElementById(id);
				if (element) {
					e.preventDefault();
					element.scrollIntoView({
						behavior: "smooth",
					});
				}
			}
		};

		document.addEventListener("click", handleAnchorClick);

		return () => {
			document.removeEventListener("click", handleAnchorClick);
		};
	}, []);

	return (
		<div className="min-h-screen">
			<NavBar />
			<main>
				<Hero />
				<Features />
				<HowItWorks />
				<WaitlistForm />
			</main>
			<Footer />
		</div>
	);
};

export default Index;
