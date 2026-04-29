import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout({ children }) {
    return (
        <div className="sii-shell">
            <Navbar />
            {children}
            <Footer />
        </div>
    )
}