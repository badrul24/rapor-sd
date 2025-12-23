export default function Logo({ size = 40, showText = true, textSize = "text-xl", clickable = false, onClick, textColor = "blue" }) {
  const TextComponent = clickable ? 'button' : 'span'
  
  const getTextClasses = (color) => {
    if (color === "white") {
      return clickable 
        ? `${textSize} font-bold text-white hover:text-gray-200 transition-colors cursor-pointer`
        : `${textSize} font-bold text-white`
    } else {
      return clickable 
        ? `${textSize} font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer`
        : `${textSize} font-bold text-blue-600`
    }
  }
  
  const textProps = clickable ? { 
    onClick, 
    className: getTextClasses(textColor)
  } : { 
    className: getTextClasses(textColor)
  }

  return (
    <div className="flex items-center gap-2">
      <img
        src="/logo.svg"
        alt="SIRADA Logo"
        className={`w-${size/4} h-${size/4}`}
        style={{ width: `${size}px`, height: `${size}px` }}
      />
      {showText && (
        <TextComponent {...textProps}>
          SIRADA
        </TextComponent>
      )}
    </div>
  )
}