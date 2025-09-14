import React, { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Grid,
    InputAdornment,
    Avatar,
    Card,
    CardContent,
    TablePagination,
    Tooltip,
    Menu,
    ListItemIcon,
    ListItemText,
    Divider,
    Badge,
    LinearProgress,
    Tabs,
    Tab
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    Close as CloseIcon,
    Person as PersonIcon,
    MoreVert as MoreVertIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    School as SchoolIcon,
    DateRange as DateRangeIcon,
    Block as BlockIcon,
    CheckCircle as CheckCircleIcon,
    FilterList as FilterListIcon
} from '@mui/icons-material';

const StudentsPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [courseFilter, setCourseFilter] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const [studentData, setStudentData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        course: '',
        status: 'active',
        enrollmentDate: new Date().toISOString().split('T')[0]
    });

    // Datos de ejemplo de estudiantes
    const [students, setStudents] = useState([
        {
            id: 1,
            firstName: 'Ana',
            lastName: 'García',
            email: 'ana.garcia@email.com',
            phone: '+51 987 654 321',
            dateOfBirth: '1995-03-15',
            course: 'Introducción a React',
            courseId: 1,
            status: 'active',
            enrollmentDate: '2024-01-10',
            progress: 75,
            completedLessons: 18,
            totalLessons: 24,
            lastActivity: '2024-03-10',
            avatar: 'AG'
        },
        {
            id: 2,
            firstName: 'Carlos',
            lastName: 'López',
            email: 'carlos.lopez@email.com',
            phone: '+51 987 654 322',
            dateOfBirth: '1992-07-22',
            course: 'Diseño UX/UI Avanzado',
            courseId: 2,
            status: 'active',
            enrollmentDate: '2024-02-15',
            progress: 45,
            completedLessons: 12,
            totalLessons: 20,
            lastActivity: '2024-03-09',
            avatar: 'CL'
        },
        {
            id: 3,
            firstName: 'María',
            lastName: 'Rodríguez',
            email: 'maria.rodriguez@email.com',
            phone: '+51 987 654 323',
            dateOfBirth: '1998-11-08',
            course: 'Python para Data Science',
            courseId: 3,
            status: 'completed',
            enrollmentDate: '2023-12-01',
            progress: 100,
            completedLessons: 30,
            totalLessons: 30,
            lastActivity: '2024-02-28',
            avatar: 'MR'
        },
        {
            id: 4,
            firstName: 'Diego',
            lastName: 'Martínez',
            email: 'diego.martinez@email.com',
            phone: '+51 987 654 324',
            dateOfBirth: '1990-05-30',
            course: 'Marketing Digital',
            courseId: 4,
            status: 'inactive',
            enrollmentDate: '2024-01-20',
            progress: 20,
            completedLessons: 4,
            totalLessons: 16,
            lastActivity: '2024-02-15',
            avatar: 'DM'
        }
    ]);

    const courses = [
        'Introducción a React',
        'Diseño UX/UI Avanzado',
        'Python para Data Science',
        'Marketing Digital'
    ];

    const statusOptions = [
        { value: 'active', label: 'Activo', color: 'success' },
        { value: 'inactive', label: 'Inactivo', color: 'error' },
        { value: 'completed', label: 'Completado', color: 'info' },
        { value: 'suspended', label: 'Suspendido', color: 'warning' }
    ];

    const handleOpenModal = () => setIsModalOpen(true);

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setStudentData({
            firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '',
            course: '', status: 'active', enrollmentDate: new Date().toISOString().split('T')[0]
        });
    };

    const handleOpenDetailModal = (student) => {
        setSelectedStudent(student);
        setIsDetailModalOpen(true);
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedStudent(null);
    };

    const handleInputChange = (field) => (event) => {
        setStudentData(prev => ({ ...prev, [field]: event.target.value }));
    };

    const handleSubmit = () => {
        if (!studentData.firstName || !studentData.lastName || !studentData.email || !studentData.course) return;

        const newStudent = {
            id: Date.now(),
            ...studentData,
            progress: 0,
            completedLessons: 0,
            totalLessons: 24,
            lastActivity: new Date().toISOString().split('T')[0],
            avatar: (studentData.firstName[0] + studentData.lastName[0]).toUpperCase(),
            courseId: courses.indexOf(studentData.course) + 1
        };

        setStudents(prev => [newStudent, ...prev]);
        handleCloseModal();
    };

    const handleMenuClick = (event, studentId) => {
        setAnchorEl(event.currentTarget);
        setSelectedStudentId(studentId);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedStudentId(null);
    };

    const getStatusChip = (status) => {
        const statusConfig = statusOptions.find(s => s.value === status);
        return (
            <Chip
                label={statusConfig?.label}
                color={statusConfig?.color}
                size="small"
                variant="outlined"
            />
        );
    };

    const filteredStudents = students.filter(student => {
        const matchesSearch =
            student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !statusFilter || student.status === statusFilter;
        const matchesCourse = !courseFilter || student.course === courseFilter;

        return matchesSearch && matchesStatus && matchesCourse;
    });

    const paginatedStudents = filteredStudents.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Estadísticas
    const stats = {
        total: students.length,
        active: students.filter(s => s.status === 'active').length,
        completed: students.filter(s => s.status === 'completed').length,
        inactive: students.filter(s => s.status === 'inactive').length
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                    Gestión de Estudiantes
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenModal}
                >
                    Nuevo Estudiante
                </Button>
            </Box>

            {/* Estadísticas */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="primary" gutterBottom>
                                {stats.total}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Total Estudiantes
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="success.main" gutterBottom>
                                {stats.active}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Estudiantes Activos
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="info.main" gutterBottom>
                                {stats.completed}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Cursos Completados
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="error.main" gutterBottom>
                                {stats.inactive}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Estudiantes Inactivos
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Filtros */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                fullWidth
                                placeholder="Buscar estudiantes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12} sm={3} md={2}>
                            <TextField
                                fullWidth
                                select
                                label="Estado"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                size="small"
                            >
                                <MenuItem value="">Todos</MenuItem>
                                {statusOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={3} md={2}>
                            <TextField
                                fullWidth
                                select
                                label="Curso"
                                value={courseFilter}
                                onChange={(e) => setCourseFilter(e.target.value)}
                                size="small"
                            >
                                <MenuItem value="">Todos</MenuItem>
                                {courses.map((course) => (
                                    <MenuItem key={course} value={course}>
                                        {course}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={12} md={4}>
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                                <Button
                                    variant="outlined"
                                    startIcon={<FilterListIcon />}
                                    size="small"
                                >
                                    Más Filtros
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Tabla de estudiantes */}
            <TableContainer component={Paper} elevation={2}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'grey.50' }}>
                            <TableCell sx={{ fontWeight: 600 }}>Estudiante</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Contacto</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Curso</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Progreso</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Última Actividad</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedStudents.length > 0 ? (
                            paginatedStudents.map((student) => (
                                <TableRow key={student.id} hover>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                {student.avatar}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                                                    {student.firstName} {student.lastName}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    ID: {student.id}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                <Typography variant="body2">{student.email}</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                <Typography variant="body2">{student.phone}</Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={student.course}
                                            size="small"
                                            variant="outlined"
                                            color="primary"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ minWidth: 120 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                    {student.progress}%
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    ({student.completedLessons}/{student.totalLessons})
                                                </Typography>
                                            </Box>
                                            <LinearProgress
                                                variant="determinate"
                                                value={student.progress}
                                                sx={{ height: 6, borderRadius: 3 }}
                                            />
                                        </Box>
                                    </TableCell>
                                    <TableCell>{getStatusChip(student.status)}</TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {new Date(student.lastActivity).toLocaleDateString('es-ES')}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                            <Tooltip title="Ver detalles">
                                                <IconButton
                                                    size="small"
                                                    color="info"
                                                    onClick={() => handleOpenDetailModal(student)}
                                                >
                                                    <ViewIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Editar">
                                                <IconButton size="small" color="primary">
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Más opciones">
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => handleMenuClick(e, student.id)}
                                                >
                                                    <MoreVertIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                        <PersonIcon sx={{ fontSize: 64, color: 'grey.400' }} />
                                        <Typography variant="h6" color="text.secondary">
                                            No se encontraron estudiantes
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {searchTerm || statusFilter || courseFilter
                                                ? 'Intenta ajustar los filtros de búsqueda'
                                                : 'Comienza agregando tu primer estudiante'}
                                        </Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredStudents.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Filas por página:"
                />
            </TableContainer>

            {/* Menu de opciones */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleMenuClose}>
                    <ListItemIcon>
                        <CheckCircleIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Marcar como completado</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleMenuClose}>
                    <ListItemIcon>
                        <BlockIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Suspender estudiante</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleMenuClose}>
                    <ListItemIcon>
                        <DeleteIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Eliminar</ListItemText>
                </MenuItem>
            </Menu>

            {/* Modal de registro de estudiante */}
            <Dialog
                open={isModalOpen}
                onClose={handleCloseModal}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { borderRadius: 2 } }}
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h5" component="span" sx={{ fontWeight: 600 }}>
                        Registrar Nuevo Estudiante
                    </Typography>
                    <IconButton onClick={handleCloseModal} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers>
                    <Grid container spacing={3} sx={{ mt: 0.5 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Nombres"
                                value={studentData.firstName}
                                onChange={handleInputChange('firstName')}
                                required
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Apellidos"
                                value={studentData.lastName}
                                onChange={handleInputChange('lastName')}
                                required
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Correo Electrónico"
                                type="email"
                                value={studentData.email}
                                onChange={handleInputChange('email')}
                                required
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Teléfono"
                                value={studentData.phone}
                                onChange={handleInputChange('phone')}
                                placeholder="+51 987 654 321"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Fecha de Nacimiento"
                                type="date"
                                value={studentData.dateOfBirth}
                                onChange={handleInputChange('dateOfBirth')}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="Curso"
                                value={studentData.course}
                                onChange={handleInputChange('course')}
                                required
                            >
                                {courses.map((course) => (
                                    <MenuItem key={course} value={course}>
                                        {course}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Fecha de Inscripción"
                                type="date"
                                value={studentData.enrollmentDate}
                                onChange={handleInputChange('enrollmentDate')}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="Estado"
                                value={studentData.status}
                                onChange={handleInputChange('status')}
                            >
                                {statusOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleCloseModal} color="inherit">
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={!studentData.firstName || !studentData.lastName || !studentData.email || !studentData.course}
                    >
                        Registrar Estudiante
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal de detalles del estudiante */}
            <Dialog
                open={isDetailModalOpen}
                onClose={handleCloseDetailModal}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { borderRadius: 2 } }}
            >
                {selectedStudent && (
                    <>
                        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                                    {selectedStudent.avatar}
                                </Avatar>
                                <Box>
                                    <Typography variant="h5" component="span" sx={{ fontWeight: 600 }}>
                                        {selectedStudent.firstName} {selectedStudent.lastName}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {selectedStudent.email}
                                    </Typography>
                                </Box>
                            </Box>
                            <IconButton onClick={handleCloseDetailModal} size="small">
                                <CloseIcon />
                            </IconButton>
                        </DialogTitle>

                        <DialogContent dividers>
                            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
                                <Tab label="Información Personal" />
                                <Tab label="Progreso del Curso" />
                            </Tabs>

                            {tabValue === 0 && (
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6}>
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Información de Contacto
                                            </Typography>
                                            <Box sx={{ mt: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                    <EmailIcon sx={{ fontSize: 16 }} />
                                                    <Typography variant="body2">{selectedStudent.email}</Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                    <PhoneIcon sx={{ fontSize: 16 }} />
                                                    <Typography variant="body2">{selectedStudent.phone}</Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <DateRangeIcon sx={{ fontSize: 16 }} />
                                                    <Typography variant="body2">
                                                        Nacido el {new Date(selectedStudent.dateOfBirth).toLocaleDateString('es-ES')}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Información Académica
                                            </Typography>
                                            <Box sx={{ mt: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                    <SchoolIcon sx={{ fontSize: 16 }} />
                                                    <Typography variant="body2">{selectedStudent.course}</Typography>
                                                </Box>
                                                <Box sx={{ mb: 1 }}>
                                                    <Typography variant="body2">
                                                        Estado: {getStatusChip(selectedStudent.status)}
                                                    </Typography>
                                                </Box>
                                                <Typography variant="body2">
                                                    Inscrito el {new Date(selectedStudent.enrollmentDate).toLocaleDateString('es-ES')}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                </Grid>
                            )}

                            {tabValue === 1 && (
                                <Box>
                                    <Card variant="outlined" sx={{ mb: 3 }}>
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                Progreso General
                                            </Typography>
                                            <Box sx={{ mb: 2 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                    <Typography variant="body2">
                                                        {selectedStudent.completedLessons} de {selectedStudent.totalLessons} lecciones completadas
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                        {selectedStudent.progress}%
                                                    </Typography>
                                                </Box>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={selectedStudent.progress}
                                                    sx={{ height: 8, borderRadius: 4 }}
                                                />
                                            </Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Última actividad: {new Date(selectedStudent.lastActivity).toLocaleDateString('es-ES')}
                                            </Typography>
                                        </CardContent>
                                    </Card>

                                    <Typography variant="h6" gutterBottom>
                                        Actividad Reciente
                                    </Typography>
                                    <Box sx={{ pl: 2 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            No hay actividad reciente registrada.
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                        </DialogContent>

                        <DialogActions sx={{ p: 3 }}>
                            <Button onClick={handleCloseDetailModal} color="inherit">
                                Cerrar
                            </Button>
                            <Button variant="contained" startIcon={<EditIcon />}>
                                Editar Estudiante
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
};

export default StudentsPage;