/**
 * ===========================================
 * Kelola Jadwal Sidang - Admin Page
 * ===========================================
 * Halaman untuk admin mengelola jadwal sidang
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, type Variants } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    LayoutDashboard,
    Users,
    Calendar,
    Bell,
    ChevronDown,
    LogOut,
    Settings,
    User,
    Search,
    Plus,
    Edit,
    Trash2,
    MoreHorizontal,
    FileText,
    ChevronLeft,
    ChevronRight,
    Clock,
    CalendarDays,
    CheckCircle,
    XCircle,
    AlertCircle,
    X,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logout } from '@/store/slices/authSlice'
import api from '@/lib/api'

// Types
interface JadwalSidang {
    _id: string
    mahasiswa: {
        _id: string
        name: string
        nim_nip: string
        judulTA?: string
    }
    jenisJadwal: string
    tanggal: string
    waktuMulai: string
    waktuSelesai?: string
    ruangan?: string
    penguji: { _id: string; name: string }[]
    status: string
}

interface UserOption {
    _id: string
    name: string
    nim_nip: string
    judulTA?: string
}

// Menu items
const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, active: false, path: '/admin/dashboard' },
]

const managementItems = [
    { label: 'Manajemen User', icon: Users, active: false, path: '/admin/users' },
    { label: 'Kelola Jadwal', icon: Calendar, active: true, path: '/admin/jadwal' },
]

const reportItems = [
    { label: 'Laporan', icon: FileText, path: '/admin/laporan' },
]

// Ruangan options
const ruanganOptions = ['B302', 'B303', 'B304', 'B305', 'B306']

export const KelolaJadwal = () => {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const { user } = useAppSelector((state) => state.auth)

    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [isLoading, setIsLoading] = useState(true)
    const [jadwalList, setJadwalList] = useState<JadwalSidang[]>([])

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form states
    const [mahasiswaList, setMahasiswaList] = useState<UserOption[]>([])
    const [dosenList, setDosenList] = useState<UserOption[]>([])
    const [selectedMahasiswa, setSelectedMahasiswa] = useState('')
    const [jenisJadwal, setJenisJadwal] = useState('sidang_proposal')
    const [tanggal, setTanggal] = useState('')
    const [waktuMulai, setWaktuMulai] = useState('')
    const [waktuSelesai, setWaktuSelesai] = useState('')
    const [ruangan, setRuangan] = useState('')
    const [penguji1, setPenguji1] = useState('')
    const [penguji2, setPenguji2] = useState('')

    // Animation variants
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1,
            },
        },
    }

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring' as const,
                stiffness: 100,
                damping: 12,
            },
        },
    }

    const sidebarVariants: Variants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                type: 'spring' as const,
                stiffness: 100,
                damping: 15,
            },
        },
    }

    // Fetch jadwal data
    useEffect(() => {
        fetchJadwal()
        fetchUsers()
    }, [])

    const fetchJadwal = async () => {
        try {
            setIsLoading(true)
            const response = await api.get('/jadwal', { params: { limit: 100 } })
            setJadwalList(response.data.data || [])
        } catch (error) {
            console.error('Failed to fetch jadwal:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchUsers = async () => {
        try {
            // Fetch mahasiswa
            const mahasiswaRes = await api.get('/users', { params: { role: 'mahasiswa', limit: 100 } })
            setMahasiswaList(mahasiswaRes.data.data || [])

            // Fetch dosen
            const dosenRes = await api.get('/users', { params: { role: 'dosen', limit: 100 } })
            setDosenList(dosenRes.data.data || [])
        } catch (error) {
            console.error('Failed to fetch users:', error)
        }
    }

    const handleCreateJadwal = async () => {
        if (!selectedMahasiswa || !tanggal || !waktuMulai || !ruangan) {
            alert('Mohon lengkapi semua field yang wajib diisi!')
            return
        }

        setIsSubmitting(true)
        try {
            const pengujiArr = []
            if (penguji1) pengujiArr.push(penguji1)
            if (penguji2) pengujiArr.push(penguji2)

            await api.post('/jadwal', {
                mahasiswa: selectedMahasiswa,
                jenisJadwal,
                tanggal,
                waktuMulai,
                waktuSelesai: waktuSelesai || null,
                ruangan,
                penguji: pengujiArr
            })

            alert('Jadwal sidang berhasil dibuat!')
            setIsModalOpen(false)
            resetForm()
            fetchJadwal()
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } }
            alert(err.response?.data?.message || 'Gagal membuat jadwal')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteJadwal = async (id: string) => {
        if (!confirm('Apakah Anda yakin ingin membatalkan jadwal ini?')) return

        try {
            await api.delete(`/jadwal/${id}`)
            alert('Jadwal berhasil dibatalkan')
            fetchJadwal()
        } catch (error) {
            console.error('Failed to delete jadwal:', error)
            alert('Gagal membatalkan jadwal')
        }
    }

    const resetForm = () => {
        setSelectedMahasiswa('')
        setJenisJadwal('sidang_proposal')
        setTanggal('')
        setWaktuMulai('')
        setWaktuSelesai('')
        setRuangan('')
        setPenguji1('')
        setPenguji2('')
    }

    const filteredJadwal = jadwalList.filter(jadwal => {
        const matchesSearch = jadwal.mahasiswa?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            jadwal.mahasiswa?.nim_nip?.includes(searchQuery)
        const matchesStatus = statusFilter === 'all' || jadwal.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'dijadwalkan':
                return <Badge className="bg-blue-100 text-blue-600 hover:bg-blue-100 border-0"><Clock className="w-3 h-3 mr-1" />Terjadwal</Badge>
            case 'selesai':
                return <Badge className="bg-green-100 text-green-600 hover:bg-green-100 border-0"><CheckCircle className="w-3 h-3 mr-1" />Selesai</Badge>
            case 'dibatalkan':
                return <Badge className="bg-red-100 text-red-600 hover:bg-red-100 border-0"><XCircle className="w-3 h-3 mr-1" />Batal</Badge>
            default:
                return <Badge className="bg-yellow-100 text-yellow-600 hover:bg-yellow-100 border-0"><AlertCircle className="w-3 h-3 mr-1" />Pending</Badge>
        }
    }

    const statsCards = [
        { label: 'Total Jadwal', value: jadwalList.length, color: 'from-blue-500 to-blue-600', icon: CalendarDays },
        { label: 'Terjadwal', value: jadwalList.filter(j => j.status === 'dijadwalkan').length, color: 'from-cyan-500 to-cyan-600', icon: Clock },
        { label: 'Selesai', value: jadwalList.filter(j => j.status === 'selesai').length, color: 'from-green-500 to-green-600', icon: CheckCircle },
        { label: 'Dibatalkan', value: jadwalList.filter(j => j.status === 'dibatalkan').length, color: 'from-red-500 to-red-600', icon: XCircle },
    ]

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-gray-50 via-white to-gray-100">
            {/* Sidebar */}
            <motion.aside
                className="w-64 bg-white border-r border-gray-100 flex flex-col shadow-sm relative overflow-hidden"
                variants={sidebarVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Wave decoration at bottom */}
                <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
                    <svg viewBox="0 0 256 200" className="w-full h-auto" preserveAspectRatio="none">
                        <path d="M0,40 C80,80 150,20 200,60 C230,80 250,40 256,55 L256,200 L0,200 Z" fill="rgba(254, 215, 170, 0.5)" />
                        <path d="M0,70 C60,110 120,50 180,90 C220,120 240,70 256,85 L256,200 L0,200 Z" fill="rgba(253, 186, 116, 0.4)" />
                        <path d="M0,100 C50,140 100,70 160,110 C200,140 230,90 256,105 L256,200 L0,200 Z" fill="rgba(251, 146, 60, 0.3)" />
                        <path d="M0,130 C40,160 90,100 140,135 C180,160 220,120 256,140 L256,200 L0,200 Z" fill="rgba(249, 115, 22, 0.2)" />
                    </svg>
                </div>

                {/* Logo */}
                <div className="p-6 border-b border-gray-100">
                    <motion.div
                        className="flex items-center gap-3"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: 'spring' as const, stiffness: 300 }}
                    >
                        <img
                            src="/LOGO-ITEBA-TOPBAR.png"
                            alt="ITEBA Logo"
                            className="h-12 w-auto"
                        />
                        <div>
                            <h1 className="text-xl font-bold tracking-wider text-gray-800">SIMTA</h1>
                            <p className="text-xs text-gray-500">Admin Panel</p>
                        </div>
                    </motion.div>
                </div>

                {/* Menu */}
                <nav className="flex-1 p-4 space-y-6 relative z-10">
                    {/* Main Menu */}
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">Main Menu</p>
                        <ul className="space-y-1">
                            {menuItems.map((item, index) => (
                                <motion.li key={item.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}>
                                    <motion.button
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${item.active ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/30' : 'text-gray-600 hover:bg-gray-50'}`}
                                        whileHover={{ scale: 1.02, x: 4 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => navigate(item.path)}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span className="font-medium">{item.label}</span>
                                    </motion.button>
                                </motion.li>
                            ))}
                        </ul>
                    </div>

                    {/* Management */}
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">Manajemen</p>
                        <ul className="space-y-1">
                            {managementItems.map((item, index) => (
                                <motion.li key={item.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + index * 0.1 }}>
                                    <motion.button
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${item.active ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/30' : 'text-gray-600 hover:bg-gray-50'}`}
                                        whileHover={{ scale: 1.02, x: 4 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => navigate(item.path)}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span className="font-medium">{item.label}</span>
                                    </motion.button>
                                </motion.li>
                            ))}
                        </ul>
                    </div>

                    {/* Reports */}
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">Laporan</p>
                        <ul className="space-y-1">
                            {reportItems.map((item, index) => (
                                <motion.li key={item.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + index * 0.1 }}>
                                    <motion.button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 transition-all duration-200" whileHover={{ scale: 1.02, x: 4 }} whileTap={{ scale: 0.98 }}>
                                        <item.icon className="w-5 h-5" />
                                        <span className="font-medium">{item.label}</span>
                                    </motion.button>
                                </motion.li>
                            ))}
                        </ul>
                    </div>
                </nav>

                {/* Footer */}
                <div className="p-4 relative z-10">
                    <motion.p className="text-xs text-orange-700 font-medium text-center drop-shadow-sm" animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
                        Institut Teknologi Batam 2025
                    </motion.p>
                </div>
            </motion.aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <motion.header
                    className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Kelola Jadwal Sidang</h1>
                        <p className="text-sm text-gray-500">Atur jadwal sidang tugas akhir</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <motion.button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                        </motion.button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <motion.button className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-gray-50 transition-colors" whileHover={{ scale: 1.02 }}>
                                    <Avatar className="w-8 h-8">
                                        <AvatarImage src={user?.avatar || undefined} />
                                        <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white text-sm">
                                            {user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'AD'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                </motion.button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>{user?.name || 'Admin'}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer"><User className="w-4 h-4 mr-2" />Profile</DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer"><Settings className="w-4 h-4 mr-2" />Settings</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="cursor-pointer text-red-600"
                                    onClick={() => {
                                        dispatch(logout())
                                        navigate('/')
                                    }}
                                >
                                    <LogOut className="w-4 h-4 mr-2" />Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </motion.header>

                {/* Page Content */}
                <main className="flex-1 p-6 overflow-auto">
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
                        {/* Stats Cards */}
                        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {statsCards.map((stat, index) => (
                                <motion.div
                                    key={stat.label}
                                    className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all"
                                    whileHover={{ y: -2 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                                            <p className="text-sm text-gray-500">{stat.label}</p>
                                        </div>
                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                                            <stat.icon className="w-5 h-5 text-white" />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Table Section */}
                        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            {/* Table Header */}
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                    <div className="flex flex-wrap items-center gap-4">
                                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                                            <SelectTrigger className="w-40 h-9 bg-gray-50 border-gray-200">
                                                <SelectValue placeholder="Filter Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Semua Status</SelectItem>
                                                <SelectItem value="dijadwalkan">Terjadwal</SelectItem>
                                                <SelectItem value="selesai">Selesai</SelectItem>
                                                <SelectItem value="dibatalkan">Batal</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <Input
                                                type="text"
                                                placeholder="Cari mahasiswa..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-9 h-9 w-64 bg-gray-50 border-gray-200 rounded-xl"
                                            />
                                        </div>
                                    </div>

                                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                        <Button
                                            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl"
                                            onClick={() => setIsModalOpen(true)}
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Buat Jadwal
                                        </Button>
                                    </motion.div>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                                            <TableHead className="font-semibold text-gray-700">Mahasiswa</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Jenis</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Tanggal & Waktu</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Ruangan</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Penguji</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Status</TableHead>
                                            <TableHead className="font-semibold text-gray-700 text-center">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-12">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500"></div>
                                                        <p className="text-gray-500 text-sm">Memuat data jadwal...</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredJadwal.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-12">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <Calendar className="w-12 h-12 text-gray-300" />
                                                        <p className="text-gray-500">Belum ada jadwal sidang</p>
                                                        <Button
                                                            variant="outline"
                                                            className="mt-2"
                                                            onClick={() => setIsModalOpen(true)}
                                                        >
                                                            <Plus className="w-4 h-4 mr-2" />
                                                            Buat Jadwal Pertama
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredJadwal.map((jadwal, index) => (
                                                <motion.tr
                                                    key={jadwal._id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.05 * index }}
                                                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                                                >
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium text-gray-800">{jadwal.mahasiswa?.name || '-'}</p>
                                                            <p className="text-xs text-gray-400">NIM: {jadwal.mahasiswa?.nim_nip || '-'}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={jadwal.jenisJadwal === 'sidang_proposal' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}>
                                                            {jadwal.jenisJadwal === 'sidang_proposal' ? 'Proposal' : 'Skripsi'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <CalendarDays className="w-4 h-4 text-gray-400" />
                                                            <div>
                                                                <p className="font-medium text-gray-700">
                                                                    {new Date(jadwal.tanggal).toLocaleDateString('id-ID', {
                                                                        weekday: 'short',
                                                                        day: 'numeric',
                                                                        month: 'short',
                                                                        year: 'numeric'
                                                                    })}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {jadwal.waktuMulai}{jadwal.waktuSelesai ? ` - ${jadwal.waktuSelesai}` : ''}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className="bg-gray-100 text-gray-700">{jadwal.ruangan || '-'}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            {jadwal.penguji?.map((p, i) => (
                                                                <p key={p._id} className="text-sm text-gray-700">{i + 1}. {p.name}</p>
                                                            ))}
                                                            {(!jadwal.penguji || jadwal.penguji.length === 0) && (
                                                                <p className="text-sm text-gray-400">Belum ada penguji</p>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{getStatusBadge(jadwal.status)}</TableCell>
                                                    <TableCell className="text-center">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                    <MoreHorizontal className="w-4 h-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem className="cursor-pointer"><Edit className="w-4 h-4 mr-2" />Edit</DropdownMenuItem>
                                                                <DropdownMenuItem className="cursor-pointer"><CheckCircle className="w-4 h-4 mr-2" />Selesai</DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="cursor-pointer text-red-600"
                                                                    onClick={() => handleDeleteJadwal(jadwal._id)}
                                                                >
                                                                    <Trash2 className="w-4 h-4 mr-2" />Batalkan
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </motion.tr>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                                <p className="text-sm text-gray-500">Menampilkan {filteredJadwal.length} dari {jadwalList.length} jadwal</p>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
                                        <ChevronLeft className="w-4 h-4 mr-1" />Previous
                                    </Button>
                                    <motion.button
                                        onClick={() => setCurrentPage(1)}
                                        className={`w-8 h-8 rounded-lg font-medium transition-all ${currentPage === 1 ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        1
                                    </motion.button>
                                    <Button variant="ghost" size="sm" onClick={() => setCurrentPage(currentPage + 1)}>
                                        Next<ChevronRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </main>
            </div>

            {/* Create Jadwal Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-orange-500" />
                            Buat Jadwal Sidang Baru
                        </DialogTitle>
                        <DialogDescription>
                            Lengkapi form berikut untuk membuat jadwal sidang
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 mt-4">
                        {/* Mahasiswa */}
                        <div>
                            <Label className="text-sm font-medium">Mahasiswa *</Label>
                            <Select value={selectedMahasiswa} onValueChange={setSelectedMahasiswa}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Pilih mahasiswa..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {mahasiswaList.map(mhs => (
                                        <SelectItem key={mhs._id} value={mhs._id}>
                                            {mhs.name} ({mhs.nim_nip})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Jenis Jadwal */}
                        <div>
                            <Label className="text-sm font-medium">Jenis Sidang *</Label>
                            <Select value={jenisJadwal} onValueChange={setJenisJadwal}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="sidang_proposal">Sidang Proposal</SelectItem>
                                    <SelectItem value="sidang_skripsi">Sidang Skripsi</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Tanggal & Waktu */}
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <Label className="text-sm font-medium">Tanggal *</Label>
                                <Input
                                    type="date"
                                    value={tanggal}
                                    onChange={(e) => setTanggal(e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Mulai *</Label>
                                <Input
                                    type="time"
                                    value={waktuMulai}
                                    onChange={(e) => setWaktuMulai(e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Selesai</Label>
                                <Input
                                    type="time"
                                    value={waktuSelesai}
                                    onChange={(e) => setWaktuSelesai(e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        {/* Ruangan */}
                        <div>
                            <Label className="text-sm font-medium">Ruangan *</Label>
                            <Select value={ruangan} onValueChange={setRuangan}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Pilih ruangan..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {ruanganOptions.map(r => (
                                        <SelectItem key={r} value={r}>{r}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Penguji */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label className="text-sm font-medium">Penguji 1</Label>
                                <Select value={penguji1} onValueChange={setPenguji1}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Pilih penguji..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {dosenList.map(dosen => (
                                            <SelectItem key={dosen._id} value={dosen._id}>
                                                {dosen.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Penguji 2</Label>
                                <Select value={penguji2} onValueChange={setPenguji2}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Pilih penguji..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {dosenList.filter(d => d._id !== penguji1).map(dosen => (
                                            <SelectItem key={dosen._id} value={dosen._id}>
                                                {dosen.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                                <X className="w-4 h-4 mr-2" />
                                Batal
                            </Button>
                            <Button
                                className="bg-gradient-to-r from-orange-500 to-orange-600"
                                onClick={handleCreateJadwal}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Buat Jadwal
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default KelolaJadwal
