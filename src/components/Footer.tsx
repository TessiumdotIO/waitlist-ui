import React from "react";
import { cn } from "@/lib/utils";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord, faTelegram, faXTwitter } from '@fortawesome/free-brands-svg-icons';


const Footer: React.FC = () => {
	return (
		<footer className="bg-bg-primary/2 mt-16 border-t border-border">
			<div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-12">
					<div className="md:col-span-2">
						<div className="flex items-center gap-2 mb-4">
							<div className="flex items-center text-accent">
								<img
									src="/logolight.PNG"
									className="h-5 w-5 m-1"
									alt="LOGO"
								/>
								<span className="text-accent font-bold text-2xl font-display">
									Tessium
								</span>
							</div>
						</div>

						<p className="text-muted-foreground max-w-md mb-6">
						⁠Tessium is poised to become the premier infrastructure where knowledge acquisition translates to valuable growth and rewards.

						</p>

						<div className="flex space-x-4">
							<a
								href="https://t.me/tessium_io"
								className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors"
								aria-label="Telegram"
							>
								{/* <Telegram className="w-5 h-5 text-foreground/80" /> */}
								<FontAwesomeIcon icon={faTelegram} className="w-5 h-5 text-foreground/80"/>
							</a>
							<a
								href="https://discord.gg/7M8qjGA4GK"
								className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors"
								aria-label="Discord"
							>
								{/* <Discord className="w-5 h-5 text-foreground/80" /> */}
								<FontAwesomeIcon icon={faDiscord} className="w-5 h-5 text-foreground/80"/>

							</a>
							<a
								href="https://x.com/tessium_io?s=21"
								className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors"
								aria-label="Twitter"
							>
								{/* <Twitter className="w-5 h-5 text-foreground/80" /> */}
								<FontAwesomeIcon icon={faXTwitter} className="w-5 h-5 text-foreground/80"/>

							</a>
						
						</div>
					</div>

					{/* <div>
						<h3 className="font-semibold text-lg mb-4 font-display">
							Platform
						</h3>
						<ul className="space-y-3">
							{[
								"Features",
								"How it Works",
								"Pricing",
								"Roadmap",
							].map((item, i) => (
								<li key={i}>
									<a
										href="#"
										className="text-muted-foreground hover:text-foreground transition-colors"
									>
										{item}
									</a>
								</li>
							))}
						</ul>
					</div> */}

					{/* <div>
						<h3 className="font-semibold text-lg mb-4 font-display">
							Company
						</h3>
						<ul className="space-y-3">
							{[
								"About",
								"Blog",
								"Careers",
								"Contact",
								"Press",
							].map((item, i) => (
								<li key={i}>
									<a
										href="#"
										className="text-muted-foreground hover:text-foreground transition-colors"
									>
										{item}
									</a>
								</li>
							))}
						</ul>
					</div> */}
				</div>

				<div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center">
					<p className="text-muted-foreground text-sm mb-4 md:mb-0">
						© {new Date().getFullYear()} Tessium. All rights
						reserved.
					</p>

					{/* <div className="flex space-x-6">
						{["Terms", "Privacy", "Cookies"].map((item, i) => (
							<a
								key={i}
								href="#"
								className="text-sm text-muted-foreground hover:text-foreground transition-colors"
							>
								{item}
							</a>
						))}
					</div> */}
				</div>
			</div>
		</footer>
	);
};

export default Footer;
