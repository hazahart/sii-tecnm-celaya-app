export default function Footer() {
    return (
        <footer className="sii-footer">
            <span>Tecnológico Nacional de México · Campus Celaya</span>
            <span>Sistema de Información Institucional · {new Date().getFullYear()}</span>
        </footer>
    )
}