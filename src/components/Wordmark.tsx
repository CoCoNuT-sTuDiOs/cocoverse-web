import Link from 'next/link';

/*** The logo: "CocoVerse" in Bagel Fat One, with "ui" 
 * in a small gold clay pill. */

export function Wordmark({size ="text-3xl"} : {size?: string}) {
    return (
        <Link 
            href="/"
            ariel-label="CocoVerse UI home"
            className={`inline-flex items-center gap-2 font-logo leading-none ${size}`}
        >
        <span className="text-ink">CocoVerse</span>
        <span className="rounded-full bg-gradient-to-br from-gold-bright via-gold to-gold-deep px-3 py-1 text-[0.55em] text-[#1c1405] shadow-[var(--clay-raised)]">
        ui
        </span>
      </Link>
    );

}