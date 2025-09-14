import { useState, useContext } from 'react';
import '../styles/Login.css';
import { signInWithEmailAndPassword } from 'firebase/auth'
import { AuthContext } from '../contexts/AuthContextApp';
import { useNavigate } from 'react-router-dom';
import { showInfoToast } from '../utils/showInfoToast';
import { useForm } from 'react-hook-form';

const LoginPage = () => {
    const [modo, setModo] = useState('login');
    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [recordarme, setRecordarme] = useState(false);
    const { auth } = useContext(AuthContext);
    const navigation = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm();
    const signIn = (data) => {
        setCargando(true);
        signInWithEmailAndPassword(auth, data.email, data.password)
            .then(_ => {
                navigation('/')
            })
            .catch(error => {
                setCargando(false);
                showInfoToast(error.code.split('/')[1].split('-').join(' '));
            })
    }
    return (
        <div className="login-page">
            {/* Fondo decorativo */}
            <div className="background-decoration">
                <div className="decoration-circle circle-1"></div>
                <div className="decoration-circle circle-2"></div>
                <div className="decoration-circle circle-3"></div>
            </div>

            <div className="login-container">
                {/* Panel izquierdo - Información */}
                <div className="info-panel">
                    <div className="info-content">
                        <div className="logo-section">
                            <div className="logo">📚</div>
                            <h1>Aula Virtual</h1>
                            <p>Plataforma Educativa</p>
                        </div>

                        <div className="features-list">
                            <div className="feature-item">
                                <div className="feature-icon">🎓</div>
                                <div className="feature-content">
                                    <h3>Cursos Interactivos</h3>
                                    <p>Accede a contenido multimedia y recursos de aprendizaje</p>
                                </div>
                            </div>

                            <div className="feature-item">
                                <div className="feature-icon">📊</div>
                                <div className="feature-content">
                                    <h3>Seguimiento de Progreso</h3>
                                    <p>Monitorea tu avance académico en tiempo real</p>
                                </div>
                            </div>

                            <div className="feature-item">
                                <div className="feature-icon">👥</div>
                                <div className="feature-content">
                                    <h3>Colaboración</h3>
                                    <p>Conecta con compañeros e instructores</p>
                                </div>
                            </div>
                        </div>

                        <div className="testimonial">
                            <div className="testimonial-content">
                                <p>"Una plataforma excelente que ha transformado mi experiencia de aprendizaje"</p>
                                <div className="testimonial-author">
                                    <div className="author-avatar">MG</div>
                                    <div className="author-info">
                                        <span className="author-name">María González</span>
                                        <span className="author-role">Estudiante de Ingeniería</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="form-panel">
                    <div className="form-container">
                        {/* Tabs */}
                        <div className="form-tabs">
                            <button
                                className={`tab ${modo === 'login' ? 'active' : ''}`}
                                onClick={() => setModo('login')}
                            >
                                Iniciar Sesión
                            </button>
                            <button
                                className={`tab ${modo === 'registro' ? 'active' : ''}`}
                                onClick={() => setModo('registro')}
                            >
                                Registrarse
                            </button>
                        </div>
                        {modo === 'login' && (
                            <form onSubmit={handleSubmit(signIn)} className="auth-form">
                                <div className="form-header">
                                    <h2>¡Bienvenido de nuevo! 👋</h2>
                                    <p>Inicia sesión en tu cuenta para continuar aprendiendo</p>
                                </div>

                                <div className="form-group">
                                    <label>Email</label>
                                    <div className="input-container">
                                        <input
                                            type="email"
                                            {...register('email', { required: true })}
                                            placeholder="tu-email@universidad.edu"

                                        />
                                        <span className="input-icon">📧</span>
                                    </div>
                                    {errors.email && (<span style={{ fontSize: '0.8rem', color: 'red' }}>Email es requerido</span>)}
                                </div>

                                <div className="form-group">
                                    <label>Contraseña</label>
                                    <div className="input-container">
                                        <input
                                            type={mostrarPassword ? 'text' : 'password'}
                                            {...register('password', { required: true })}
                                            placeholder="Tu contraseña"

                                        />
                                        <button
                                            type="button"
                                            className="toggle-password"
                                            onClick={() => setMostrarPassword(!mostrarPassword)}
                                        >
                                            {mostrarPassword ? '👁️' : '👁️‍🗨️'}
                                        </button>
                                        {errors.email && (<span style={{ fontSize: '0.8rem', color: 'red' }}>Contraseña es requerido</span>)}
                                    </div>

                                </div>
                                <div className="form-options">
                                    <label className="checkbox-container">
                                        <input
                                            type="checkbox"
                                            checked={recordarme}
                                            onChange={(e) => setRecordarme(e.target.checked)}
                                        />
                                        <span className="checkmark"></span>
                                        Recordarme
                                    </label>

                                    <button
                                        type="button"
                                        className="link-button"
                                        onClick={() => setModo('recuperar')}
                                    >
                                        ¿Olvidaste tu contraseña?
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={cargando}
                                >
                                    {cargando ? (
                                        <>
                                            <span className="spinner"></span>
                                            Iniciando sesión...
                                        </>
                                    ) : (
                                        'Iniciar Sesión'
                                    )}
                                </button>

                                <div className="divider">
                                    <span>o continúa con</span>
                                </div>

                                <div className="social-buttons">
                                    <button type="button" className="btn-google">
                                        <span className="google-icon">G</span>
                                        Google
                                    </button>
                                    <button type="button" className="btn-microsoft">
                                        <span className="microsoft-icon">⊞</span>
                                        Microsoft
                                    </button>
                                </div>
                            </form>
                        )}
                        {modo === 'recuperar' && (
                            <div className="auth-form">
                                <div className="form-header">
                                    <h2>Recuperar Contraseña 🔐</h2>
                                    <p>Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña</p>
                                </div>

                                <div className="form-group">
                                    <label>Email</label>
                                    <div className="input-container">
                                        <input
                                            type="email"
                                            placeholder="tu-email@universidad.edu"

                                        />
                                        <span className="input-icon">📧</span>
                                    </div>

                                </div>

                                <button
                                    type="button"
                                    className="btn-primary"
                                    disabled={cargando}

                                >
                                    {cargando ? (
                                        <>
                                            <span className="spinner"></span>
                                            Enviando...
                                        </>
                                    ) : (
                                        'Enviar Enlace de Recuperación'
                                    )}
                                </button>

                                <div className="form-footer">
                                    <p>¿Recordaste tu contraseña?
                                        <button
                                            type="button"
                                            className="link-button"
                                            onClick={() => setModo('login')}
                                        >
                                            Volver al inicio de sesión
                                        </button>
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;