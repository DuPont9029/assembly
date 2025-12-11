import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-gray-100 py-6 mt-auto">
      <div className="max-w-4xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-sm text-gray-500">
          © {new Date().getFullYear()} Student Council
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="https://bdqkkrbu7qskoptqv6d5a2upwapqycr7pc74ij5mx4lu6cxvw4ea.arweave.net/COClRDT8JKc-cK-H0GqPsB8MCj94v8QnrL8XTwr1twg"
            className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            Sito Decentralizzato
          </Link>
          <Link
            href="https://ardrive.trump-ario.store/#/file/d597e202-1fe9-4b42-90dc-d84892e988c3/view"
            className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            Download Sito Decentralizzato
          </Link>
        </div>
      </div>
    </footer>
  );
}
