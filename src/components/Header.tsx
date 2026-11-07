import {ThemeToggle} from "@/components/ThemeToggle";
import {Wordmark} from "@/components/Wordmark";

export function Header() {
    return(
    <header className="relative z-50 mx-auto flex w-full max-w-[1400px] items-center justify-between px-6 py-6">
        <div data-hdr data-reveal>
            <Wordmark />
        </div>
        <div data-hdr data-reveal>
            <ThemeToggle />
        </div>
         </header>
    );
}