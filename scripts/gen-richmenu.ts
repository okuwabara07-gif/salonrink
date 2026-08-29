import { generateOwnerRichMenuSvg } from '../lib/line-messages/owner-richmenu-svg'
import { writeFileSync } from 'fs'
writeFileSync('/tmp/owner-richmenu.svg', generateOwnerRichMenuSvg())
console.log('SVG generated: /tmp/owner-richmenu.svg')
