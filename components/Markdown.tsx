import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function isExternalUrl(url: string) {
  return /^(https?:)?\/\//.test(url);
}

export default function Markdown({
  content,
  imageBasePath,
}: {
  content: string;
  imageBasePath?: string;
}) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => <h1 className="text-3xl font-bold mt-10 mb-4">{children}</h1>,
        h2: ({ children }) => <h2 className="text-2xl font-bold mt-8 mb-3">{children}</h2>,
        h3: ({ children }) => <h3 className="text-xl font-bold mt-6 mb-3">{children}</h3>,
        p: ({ children }) => <p className="mb-6 leading-relaxed">{children}</p>,
        ul: ({ children }) => <ul className="list-disc pl-6 mb-6 space-y-2 leading-relaxed">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-6 mb-6 space-y-2 leading-relaxed">{children}</ol>,
        blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-300 pl-4 mb-6 italic">{children}</blockquote>,
        code: ({ children, className }) =>
          className ? (
            <code className={`${className} block overflow-x-auto bg-gray-100 p-4 mb-6 text-sm`}>{children}</code>
          ) : (
            <code className="bg-gray-100 px-1">{children}</code>
          ),
        a: ({ href = "", children }) => (
          <a
            href={href}
            className="underline text-blue-600 hover:text-blue-800"
            {...(isExternalUrl(href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {children}
          </a>
        ),
        img: ({ src, alt = "" }) => {
          const imageSrc = typeof src === "string" ? src : "";
          const resolvedSrc =
            imageBasePath && !isExternalUrl(imageSrc) && !imageSrc.startsWith("/")
              ? `${imageBasePath}/${imageSrc}`
              : imageSrc;
          return (
            // eslint-disable-next-line @next/next/no-img-element -- Markdown images have dynamic dimensions.
            <img
              src={resolvedSrc}
              alt={alt}
              className="max-w-full h-auto rounded-lg mx-auto my-8"
            />
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
