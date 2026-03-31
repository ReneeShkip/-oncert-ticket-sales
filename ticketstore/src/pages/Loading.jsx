export default function AuthorDetails() {
    return (

        <div className="cart_page">
            <div className="alternative">
                <svg className="loader" viewBox="204 184 264 32">
                    <defs>
                        <filter id="gooey" colorInterpolationFilters="sRGB">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
                            <feColorMatrix
                                in="blur"
                                mode="matrix"
                                values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 18 -7"
                                result="gooey"
                            />
                            <feBlend in="SourceGraphic" in2="gooey" />
                        </filter>
                    </defs>

                    <g className="ellipses" fill="currentColor" filter="url(#gooey)">
                        <ellipse className="ellipse" cx="220" cy="200" rx="16" ry="16" />
                        <ellipse className="ellipse" cx="280" cy="200" rx="16" ry="16" />
                        <ellipse className="ellipse" cx="340" cy="200" rx="16" ry="16" />
                        <ellipse className="ellipse" cx="400" cy="200" rx="16" ry="16" />
                    </g>
                </svg>
            </div>
        </div>
    )
}
