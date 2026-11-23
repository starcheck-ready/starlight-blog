import { getOptimizedImageUrl } from "src/libs/imageUrl"

type LoaderProps = {
  src: string
  width: number
  quality?: number
}

const imageLoader = ({ src, width, quality }: LoaderProps) => {
  if (
    src.startsWith("/") ||
    src.startsWith("data:") ||
    src.startsWith("blob:")
  ) {
    return src
  }

  return getOptimizedImageUrl(src, width, quality ?? 75)
}

export default imageLoader
