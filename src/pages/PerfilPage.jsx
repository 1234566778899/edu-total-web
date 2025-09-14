import React, { useState, useRef, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContextApp';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Container,
  Paper,
  Grid,
  Avatar,
  Divider,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  PhotoCamera as PhotoCameraIcon,
  Grade as GradeIcon,
  Timeline as TimelineIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  Lock as LockIcon,
  Shield as ShieldIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import axios from 'axios';
import { User } from 'lucide-react';

const PerfilPage = () => {
  const { user } = useContext(AuthContext);
  const [tabActiva, setTabActiva] = useState(0);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mostrarCambioPassword, setMostrarCambioPassword] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const fileInputRef = useRef(null);

  // Estado del usuario
  const [usuario, setUsuario] = useState({
    // Información personal
    nombre: 'Juan',
    apellido: 'Pérez González',
    email: 'juan.perez@universidad.edu',
    telefono: '+51 987 654 321',
    fechaNacimiento: '1999-05-15',
    genero: 'masculino',
    direccion: 'Av. Universitaria 123, San Isidro',
    ciudad: 'Lima',
    pais: 'peru',
    biografia: 'Estudiante apasionado por la tecnología y el desarrollo web. Me interesa especialmente el frontend y la experiencia de usuario.',
    avatar: null,

    // Información académica
    carrera: 'Ingeniería en Sistemas',
    universidad: 'Universidad Tecnológica del Perú',
    semestre: '7mo Semestre',
    codigoEstudiante: 'U20201234',
    fechaIngreso: '2020-03-01',
    promedioGeneral: 16.8,
    creditosCompletados: 145,
    creditosTotales: 200,
    especialidad: 'Desarrollo de Software',

    // Configuraciones
    idioma: 'español',
    zonaHoraria: 'America/Lima',
    tema: 'claro',
    notificacionesEmail: true,
    notificacionesPush: true,
    notificacionesMovil: false,
    visibilidadPerfil: 'compañeros',

    // Estadísticas
    cursosCompletados: 12,
    cursosActivos: 4,
    horasEstudio: 245,
    examenesAprobados: 28,
    tareasPendientes: 3,
    ultimoAcceso: '2024-09-16T08:30:00'
  });

  const [passwordData, setPasswordData] = useState({
    passwordActual: '',
    passwordNueva: '',
    confirmarPassword: ''
  });

  // Opciones para formularios
  const generos = [
    { value: 'masculino', label: 'Masculino' },
    { value: 'femenino', label: 'Femenino' },
    { value: 'otro', label: 'Otro' },
    { value: 'prefiero-no-decir', label: 'Prefiero no decir' }
  ];

  const paises = [
    { value: 'peru', label: 'Perú' },
    { value: 'colombia', label: 'Colombia' },
    { value: 'ecuador', label: 'Ecuador' },
    { value: 'bolivia', label: 'Bolivia' },
    { value: 'chile', label: 'Chile' }
  ];

  const idiomas = [
    { value: 'español', label: 'Español' },
    { value: 'ingles', label: 'Inglés' },
    { value: 'portugues', label: 'Portugués' }
  ];

  const temas = [
    { value: 'claro', label: 'Claro' },
    { value: 'oscuro', label: 'Oscuro' },
    { value: 'auto', label: 'Automático' }
  ];

  const visibilidadOpciones = [
    { value: 'publico', label: 'Público' },
    { value: 'compañeros', label: 'Solo compañeros de clase' },
    { value: 'privado', label: 'Privado' }
  ];

  // Funciones
  const handleInputChange = (campo, valor) => {
    setUsuario(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const handlePasswordChange = (campo, valor) => {
    setPasswordData(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleInputChange('avatar', e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const guardarCambios = async () => {
    setGuardando(true);
    setError(null);
    try {
      // Simulación de guardado - aquí iría la llamada al backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess('Perfil actualizado correctamente');
      setModoEdicion(false);
    } catch (error) {
      setError('Error al actualizar el perfil');
    } finally {
      setGuardando(false);
    }
  };

  const cambiarPassword = async () => {
    if (passwordData.passwordNueva !== passwordData.confirmarPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setGuardando(true);
    setError(null);
    try {
      // Simulación de cambio de contraseña
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('Contraseña cambiada exitosamente');
      setMostrarCambioPassword(false);
      setPasswordData({
        passwordActual: '',
        passwordNueva: '',
        confirmarPassword: ''
      });
    } catch (error) {
      setError('Error al cambiar la contraseña');
    } finally {
      setGuardando(false);
    }
  };

  const formatearFecha = (fechaString) => {
    return new Date(fechaString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const calcularEdad = (fechaNacimiento) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const diferenciaMes = hoy.getMonth() - nacimiento.getMonth();

    if (diferenciaMes < 0 || (diferenciaMes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }

    return edad;
  };

  const porcentajeProgreso = Math.round((usuario.creditosCompletados / usuario.creditosTotales) * 100);

  // Componente del header del perfil
  const ProfileHeader = () => (
    <Paper elevation={3} sx={{ mb: 3, overflow: 'hidden' }}>
      <Box
        sx={{
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          height: 120,
          position: 'relative'
        }}
      />
      <Box sx={{ p: 3, mt: -8, position: 'relative' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  border: '4px solid white',
                  fontSize: '2rem'
                }}
                src={usuario.avatar}
              >
                {!usuario.avatar && `${user.displayName[0]}`}
              </Avatar>
              {modoEdicion && (
                <IconButton
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <PhotoCameraIcon />
                </IconButton>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </Box>
          </Grid>

          <Grid item xs>
            <Typography variant="h4" gutterBottom>
              {user.displayName}
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {usuario.carrera} • {usuario.semestre}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {usuario.universidad}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );

  // Componente de información personal
  const InformacionPersonal = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Datos Personales
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nombre"
                  value={user.displayName.split(' ')[0]}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  disabled={!modoEdicion}
                  variant={modoEdicion ? 'outlined' : 'standard'}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Apellidos"
                  value={user.displayName.split(' ')[1]}
                  onChange={(e) => handleInputChange('apellido', e.target.value)}
                  disabled={!modoEdicion}
                  variant={modoEdicion ? 'outlined' : 'standard'}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={user.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!modoEdicion}
                  variant={modoEdicion ? 'outlined' : 'standard'}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  value={user.phone}
                  onChange={(e) => handleInputChange('telefono', e.target.value)}
                  disabled={!modoEdicion}
                  variant={modoEdicion ? 'outlined' : 'standard'}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Fecha de Nacimiento"
                  type="date"
                  value={user.fechaNacimiento}
                  onChange={(e) => handleInputChange('fechaNacimiento', e.target.value)}
                  disabled={!modoEdicion}
                  variant={modoEdicion ? 'outlined' : 'standard'}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth disabled={!modoEdicion}>
                  <InputLabel>Género</InputLabel>
                  <Select
                    value={usuario.genre}
                    onChange={(e) => handleInputChange('genero', e.target.value)}
                    label="Género"
                  >
                    {generos.map(genero => (
                      <MenuItem key={genero.value} value={genero.value}>
                        {genero.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Información de Contacto
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Dirección"
                  value={user.direccion}
                  onChange={(e) => handleInputChange('direccion', e.target.value)}
                  disabled={!modoEdicion}
                  variant={modoEdicion ? 'outlined' : 'standard'}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Ciudad"
                  value={user.ciudad}
                  onChange={(e) => handleInputChange('ciudad', e.target.value)}
                  disabled={!modoEdicion}
                  variant={modoEdicion ? 'outlined' : 'standard'}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={!modoEdicion}>
                  <InputLabel>País</InputLabel>
                  <Select
                    value={user.pais}
                    onChange={(e) => handleInputChange('pais', e.target.value)}
                    label="País"
                  >
                    {paises.map(pais => (
                      <MenuItem key={pais.value} value={pais.value}>
                        {pais.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Componente de información académica
  const InformacionAcademica = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Información Académica
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Código de Estudiante"
                  value={user.codigoEstudiante}
                  disabled
                  variant="standard"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Universidad"
                  value={user.universidad}
                  disabled
                  variant="standard"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Carrera"
                  value={user.carrera}
                  disabled
                  variant="standard"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Semestre Actual"
                  value={User.semestre}
                  disabled
                  variant="standard"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Especialidad"
                  value={user.especialidad}
                  onChange={(e) => handleInputChange('especialidad', e.target.value)}
                  disabled={!modoEdicion}
                  variant={modoEdicion ? 'outlined' : 'standard'}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Fecha de Ingreso"
                  value={formatearFecha(user.fechaIngreso)}
                  disabled
                  variant="standard"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Estadísticas Académicas
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <GradeIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Promedio General"
                  secondary={user.promedioGeneral}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <SchoolIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Cursos Completados"
                  secondary={user.cursosCompletados}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <ScheduleIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Horas de Estudio"
                  secondary={`${user.horasEstudio || 0}h`}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <AssignmentIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Exámenes Aprobados"
                  secondary={user.examenesAprobados}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Progreso del curso
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">
                  Créditos completados: {usuario.creditosCompletados} de {usuario.creditosTotales}
                </Typography>
                <Typography variant="body2" color="primary" fontWeight="bold">
                  {porcentajeProgreso}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={porcentajeProgreso}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Componente de seguridad
  const Seguridad = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Configuración de Seguridad
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <LockIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Contraseña"
                  secondary="Última actualización: Hace 2 meses"
                />
                <Button
                  variant="outlined"
                  onClick={() => setMostrarCambioPassword(true)}
                >
                  Cambiar
                </Button>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <AccessTimeIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Último acceso"
                  secondary={new Date(usuario.ultimoAcceso).toLocaleString('es-ES')}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <ShieldIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Autenticación de dos factores"
                  secondary="Agrega una capa extra de seguridad a tu cuenta"
                />
                <Button variant="outlined">
                  Configurar 2FA
                </Button>
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Configuraciones
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Idioma</InputLabel>
                  <Select
                    value={usuario.idioma}
                    onChange={(e) => handleInputChange('idioma', e.target.value)}
                    label="Idioma"
                  >
                    {idiomas.map(idioma => (
                      <MenuItem key={idioma.value} value={idioma.value}>
                        {idioma.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Tema</InputLabel>
                  <Select
                    value={usuario.tema}
                    onChange={(e) => handleInputChange('tema', e.target.value)}
                    label="Tema"
                  >
                    {temas.map(tema => (
                      <MenuItem key={tema.value} value={tema.value}>
                        {tema.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Visibilidad del Perfil</InputLabel>
                  <Select
                    value={usuario.visibilidadPerfil}
                    onChange={(e) => handleInputChange('visibilidadPerfil', e.target.value)}
                    label="Visibilidad del Perfil"
                  >
                    {visibilidadOpciones.map(opcion => (
                      <MenuItem key={opcion.value} value={opcion.value}>
                        {opcion.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={usuario.notificacionesEmail}
                      onChange={(e) => handleInputChange('notificacionesEmail', e.target.checked)}
                    />
                  }
                  label="Notificaciones por Email"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={usuario.notificacionesPush}
                      onChange={(e) => handleInputChange('notificacionesPush', e.target.checked)}
                    />
                  }
                  label="Notificaciones Push"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Alertas */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Header del perfil */}
      <ProfileHeader />

      {/* Tabs */}
      <Paper elevation={2} sx={{ mb: 3 }}>
        <Tabs
          value={tabActiva}
          onChange={(e, newValue) => setTabActiva(newValue)}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<PersonIcon />} label="Información Personal" />
          <Tab icon={<SchoolIcon />} label="Información Académica" />
          <Tab icon={<SecurityIcon />} label="Seguridad" />
        </Tabs>
      </Paper>

      {/* Contenido de las tabs */}
      <Box sx={{ mt: 3 }}>
        {tabActiva === 0 && <InformacionPersonal />}
        {tabActiva === 1 && <InformacionAcademica />}
        {tabActiva === 2 && <Seguridad />}
      </Box>

      {/* Dialog para cambio de contraseña */}
      <Dialog
        open={mostrarCambioPassword}
        onClose={() => setMostrarCambioPassword(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Cambiar Contraseña</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="password"
                label="Contraseña actual"
                value={passwordData.passwordActual}
                onChange={(e) => handlePasswordChange('passwordActual', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="password"
                label="Nueva contraseña"
                value={passwordData.passwordNueva}
                onChange={(e) => handlePasswordChange('passwordNueva', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="password"
                label="Confirmar nueva contraseña"
                value={passwordData.confirmarPassword}
                onChange={(e) => handlePasswordChange('confirmarPassword', e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMostrarCambioPassword(false)}>
            Cancelar
          </Button>
          <Button
            onClick={cambiarPassword}
            variant="contained"
            disabled={guardando}
          >
            {guardando ? 'Cambiando...' : 'Cambiar Contraseña'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PerfilPage;