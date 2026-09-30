import Image from "next/image";
import { toneBg, type Tone } from "./tones";

const discSize = { sm: "size-18", md: "size-24", lg: "size-32" } as const;
const imageSizes = { sm: "72px", md: "96px", lg: "128px" } as const;

/** Foto recortada en círculo sobre un disco de color: el elemento de marca. */
export function ProductDisc({
  src, alt, tone, size = "md",
}: { src: string; alt: string; tone: Tone; size?: keyof typeof discSize }) {
  return (
    <span className={`relative block shrink-0 ${discSize[size]}`}>
      <span aria-hidden className={`absolute inset-0 rounded-full ${toneBg[tone]}`} />
      <span className="absolute inset-2 overflow-hidden rounded-full">
        <Image src={src} alt={alt} fill sizes={imageSizes[size]} className="object-cover" />
      </span>
    </span>
  );
}
