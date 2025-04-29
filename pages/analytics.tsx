import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/lib/app-context';
import { useLocation } from 'wouter';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  BarChart as BarChartIcon,
  PieChart as PieChartIcon, 
  LineChart,
  Layers,
  Car,
  Package,
  RefreshCw
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  BarChart, 
  Bar, 
  LineChart as RechartsLineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B', '#5AA454', '#A4CAED', '#A367DC', '#82CA9D'];

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('last30days');
  const { currentUser } = useAuth();
  const [location, navigate] = useLocation();
  const { toast } = useToast();

  // Redireccionar si no está autenticado
  useEffect(() => {
    if (!currentUser) {
      toast({
        title: "Acceso restringido",
        description: "Debes iniciar sesión para acceder a las analíticas",
        variant: "destructive",
      });
      navigate('/login');
    }
  }, [currentUser, navigate, toast]);

  if (!currentUser) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard de Analíticas</h1>
          <p className="text-neutral-500">
            Análisis detallado de compatibilidad de productos y vehículos
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <Select
            value={timeRange}
            onValueChange={(value) => setTimeRange(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Período de tiempo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last7days">Últimos 7 días</SelectItem>
              <SelectItem value="last30days">Últimos 30 días</SelectItem>
              <SelectItem value="last90days">Últimos 90 días</SelectItem>
              <SelectItem value="lastYear">Último año</SelectItem>
              <SelectItem value="allTime">Todo el tiempo</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <SummaryCards timeRange={timeRange} />

      <Tabs defaultValue="compatibility" className="mt-8">
        <TabsList className="grid grid-cols-1 md:grid-cols-4 mb-8">
          <TabsTrigger value="compatibility" className="flex items-center">
            <Layers className="mr-2 h-4 w-4" />
            <span>Compatibilidad</span>
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center">
            <Package className="mr-2 h-4 w-4" />
            <span>Productos</span>
          </TabsTrigger>
          <TabsTrigger value="vehicles" className="flex items-center">
            <Car className="mr-2 h-4 w-4" />
            <span>Vehículos</span>
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center">
            <LineChart className="mr-2 h-4 w-4" />
            <span>Tendencias</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compatibility" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <CompatibilityByMake timeRange={timeRange} />
            <CompatibilityByYear timeRange={timeRange} />
            <CompatibilityByCategory timeRange={timeRange} />
            <CompatibilityTrends timeRange={timeRange} />
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <TopCompatibleProducts timeRange={timeRange} />
            <ProductCategoryDistribution timeRange={timeRange} />
            <MostViewedProducts timeRange={timeRange} />
            <MostSearchedProducts timeRange={timeRange} />
          </div>
        </TabsContent>

        <TabsContent value="vehicles" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <VehicleMakeDistribution timeRange={timeRange} />
            <VehicleYearDistribution timeRange={timeRange} />
            <MostCompatibleVehicles timeRange={timeRange} />
            <MostSearchedVehicles timeRange={timeRange} />
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-8">
          <div className="grid grid-cols-1 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Tendencias de Compatibilidad a lo largo del tiempo</CardTitle>
                <CardDescription>
                  Análisis de compatibilidad de vehículos y productos a lo largo del tiempo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <CompatibilityTrends timeRange={timeRange} fullWidth />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SummaryCards({ timeRange }: { timeRange: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/analytics/summary', timeRange],
    queryFn: () => apiRequest('GET', `/api/analytics/summary?timeRange=${timeRange}`).then(res => res.json()),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-4 w-32 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-800 text-center">
        Error al cargar los datos del resumen. Por favor, intente nuevamente.
      </div>
    );
  }

  const summary = data || {
    totalProducts: 0,
    totalVehicles: 0,
    totalCompatibility: 0,
    avgProductsPerVehicle: 0
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-neutral-500">Productos Totales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{summary.totalProducts}</div>
          <p className="text-xs text-neutral-500 mt-1">Productos en catálogo</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-neutral-500">Vehículos Totales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{summary.totalVehicles}</div>
          <p className="text-xs text-neutral-500 mt-1">Vehículos registrados</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-neutral-500">Registros de Compatibilidad</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{summary.totalCompatibility}</div>
          <p className="text-xs text-neutral-500 mt-1">Relaciones de compatibilidad</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-neutral-500">Productos por Vehículo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{summary.avgProductsPerVehicle.toFixed(1)}</div>
          <p className="text-xs text-neutral-500 mt-1">Media de productos compatibles</p>
        </CardContent>
      </Card>
    </div>
  );
}

function CompatibilityByMake({ timeRange }: { timeRange: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/analytics/compatibility/make', timeRange],
    queryFn: () => apiRequest('GET', `/api/analytics/compatibility?type=make&timeRange=${timeRange}`).then(res => res.json()),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Compatibilidad por Marca</CardTitle>
          <CardDescription>Distribución de compatibilidad por marcas de vehículos</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[300px]">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Compatibilidad por Marca</CardTitle>
          <CardDescription>Distribución de compatibilidad por marcas de vehículos</CardDescription>
        </CardHeader>
        <CardContent className="text-center p-8 text-red-600">
          Error al cargar los datos
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <PieChartIcon className="h-5 w-5 mr-2 text-primary" />
          Compatibilidad por Marca
        </CardTitle>
        <CardDescription>Distribución de compatibilidad por marcas de vehículos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data?.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function CompatibilityByYear({ timeRange }: { timeRange: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/analytics/compatibility/year', timeRange],
    queryFn: () => apiRequest('GET', `/api/analytics/compatibility?type=year&timeRange=${timeRange}`).then(res => res.json()),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Compatibilidad por Año</CardTitle>
          <CardDescription>Distribución de compatibilidad por año del vehículo</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[300px]">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Compatibilidad por Año</CardTitle>
          <CardDescription>Distribución de compatibilidad por año del vehículo</CardDescription>
        </CardHeader>
        <CardContent className="text-center p-8 text-red-600">
          Error al cargar los datos
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChartIcon className="h-5 w-5 mr-2 text-primary" />
          Compatibilidad por Año
        </CardTitle>
        <CardDescription>Distribución de compatibilidad por año del vehículo</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#0088FE" name="Cantidad" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function CompatibilityByCategory({ timeRange }: { timeRange: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/analytics/compatibility/category', timeRange],
    queryFn: () => apiRequest('GET', `/api/analytics/compatibility?type=category&timeRange=${timeRange}`).then(res => res.json()),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Compatibilidad por Categoría</CardTitle>
          <CardDescription>Distribución de compatibilidad por categoría de producto</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[300px]">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Compatibilidad por Categoría</CardTitle>
          <CardDescription>Distribución de compatibilidad por categoría de producto</CardDescription>
        </CardHeader>
        <CardContent className="text-center p-8 text-red-600">
          Error al cargar los datos
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <PieChartIcon className="h-5 w-5 mr-2 text-primary" />
          Compatibilidad por Categoría
        </CardTitle>
        <CardDescription>Distribución de compatibilidad por categoría de producto</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data?.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function CompatibilityTrends({ timeRange, fullWidth = false }: { timeRange: string, fullWidth?: boolean }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/analytics/compatibility/trends', timeRange],
    queryFn: () => apiRequest('GET', `/api/analytics/compatibility/trends?timeRange=${timeRange}`).then(res => res.json()),
  });

  if (isLoading) {
    return (
      <Card className={fullWidth ? 'w-full' : ''}>
        <CardHeader>
          <CardTitle>Tendencias de Compatibilidad</CardTitle>
          <CardDescription>Evolución de compatibilidades a lo largo del tiempo</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[300px]">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={fullWidth ? 'w-full' : ''}>
        <CardHeader>
          <CardTitle>Tendencias de Compatibilidad</CardTitle>
          <CardDescription>Evolución de compatibilidades a lo largo del tiempo</CardDescription>
        </CardHeader>
        <CardContent className="text-center p-8 text-red-600">
          Error al cargar los datos
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={fullWidth ? 'w-full' : ''}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <LineChart className="h-5 w-5 mr-2 text-primary" />
          Tendencias de Compatibilidad
        </CardTitle>
        <CardDescription>Evolución de compatibilidades a lo largo del tiempo</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="compatibles" 
                stroke="#0088FE" 
                name="Compatibles" 
                activeDot={{ r: 8 }} 
              />
              <Line 
                type="monotone" 
                dataKey="incompatibles" 
                stroke="#FF8042" 
                name="Incompatibles" 
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function TopCompatibleProducts({ timeRange }: { timeRange: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/analytics/products/top-compatible', timeRange],
    queryFn: () => apiRequest('GET', `/api/analytics/products?type=top-compatible&timeRange=${timeRange}`).then(res => res.json()),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Productos Más Compatibles</CardTitle>
          <CardDescription>Productos con mayor número de vehículos compatibles</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[300px]">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Productos Más Compatibles</CardTitle>
          <CardDescription>Productos con mayor número de vehículos compatibles</CardDescription>
        </CardHeader>
        <CardContent className="text-center p-8 text-red-600">
          Error al cargar los datos
        </CardContent>
      </Card>
    );
  }

  // Transformar datos para el gráfico
  const chartData = data?.map((product: any) => ({
    name: product.title.length > 20 ? `${product.title.substring(0, 20)}...` : product.title,
    value: product.compatibilityCount
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChartIcon className="h-5 w-5 mr-2 text-primary" />
          Productos Más Compatibles
        </CardTitle>
        <CardDescription>Productos con mayor número de vehículos compatibles</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip />
              <Bar dataKey="value" fill="#00C49F" name="Compatibilidades" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function ProductCategoryDistribution({ timeRange }: { timeRange: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/analytics/products/category-distribution', timeRange],
    queryFn: () => apiRequest('GET', `/api/analytics/products?type=category-distribution&timeRange=${timeRange}`).then(res => res.json()),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribución por Categoría</CardTitle>
          <CardDescription>Distribución de productos por categoría</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[300px]">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribución por Categoría</CardTitle>
          <CardDescription>Distribución de productos por categoría</CardDescription>
        </CardHeader>
        <CardContent className="text-center p-8 text-red-600">
          Error al cargar los datos
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <PieChartIcon className="h-5 w-5 mr-2 text-primary" />
          Distribución por Categoría
        </CardTitle>
        <CardDescription>Distribución de productos por categoría</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data?.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function MostViewedProducts({ timeRange }: { timeRange: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/analytics/products/most-viewed', timeRange],
    queryFn: () => apiRequest('GET', `/api/analytics/products?type=most-viewed&timeRange=${timeRange}`).then(res => res.json()),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Productos Más Vistos</CardTitle>
          <CardDescription>Productos con mayor número de visualizaciones</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[300px]">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Productos Más Vistos</CardTitle>
          <CardDescription>Productos con mayor número de visualizaciones</CardDescription>
        </CardHeader>
        <CardContent className="text-center p-8 text-red-600">
          Error al cargar los datos
        </CardContent>
      </Card>
    );
  }

  // Transformar datos para el gráfico
  const chartData = data?.map((product: any) => ({
    name: product.title.length > 20 ? `${product.title.substring(0, 20)}...` : product.title,
    value: product.viewCount
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChartIcon className="h-5 w-5 mr-2 text-primary" />
          Productos Más Vistos
        </CardTitle>
        <CardDescription>Productos con mayor número de visualizaciones</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip />
              <Bar dataKey="value" fill="#FFBB28" name="Visualizaciones" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function MostSearchedProducts({ timeRange }: { timeRange: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/analytics/products/most-searched', timeRange],
    queryFn: () => apiRequest('GET', `/api/analytics/products?type=most-searched&timeRange=${timeRange}`).then(res => res.json()),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Productos Más Buscados</CardTitle>
          <CardDescription>Productos con mayor número de búsquedas</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[300px]">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Productos Más Buscados</CardTitle>
          <CardDescription>Productos con mayor número de búsquedas</CardDescription>
        </CardHeader>
        <CardContent className="text-center p-8 text-red-600">
          Error al cargar los datos
        </CardContent>
      </Card>
    );
  }

  // Transformar datos para el gráfico
  const chartData = data?.map((product: any) => ({
    name: product.title.length > 20 ? `${product.title.substring(0, 20)}...` : product.title,
    value: product.searchCount
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChartIcon className="h-5 w-5 mr-2 text-primary" />
          Productos Más Buscados
        </CardTitle>
        <CardDescription>Productos con mayor número de búsquedas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip />
              <Bar dataKey="value" fill="#FF8042" name="Búsquedas" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function VehicleMakeDistribution({ timeRange }: { timeRange: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/analytics/vehicles/make-distribution', timeRange],
    queryFn: () => apiRequest('GET', `/api/analytics/vehicles?type=make-distribution&timeRange=${timeRange}`).then(res => res.json()),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribución por Marca</CardTitle>
          <CardDescription>Distribución de vehículos por marca</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[300px]">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribución por Marca</CardTitle>
          <CardDescription>Distribución de vehículos por marca</CardDescription>
        </CardHeader>
        <CardContent className="text-center p-8 text-red-600">
          Error al cargar los datos
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <PieChartIcon className="h-5 w-5 mr-2 text-primary" />
          Distribución por Marca
        </CardTitle>
        <CardDescription>Distribución de vehículos por marca</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data?.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function VehicleYearDistribution({ timeRange }: { timeRange: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/analytics/vehicles/year-distribution', timeRange],
    queryFn: () => apiRequest('GET', `/api/analytics/vehicles?type=year-distribution&timeRange=${timeRange}`).then(res => res.json()),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribución por Año</CardTitle>
          <CardDescription>Distribución de vehículos por año</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[300px]">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribución por Año</CardTitle>
          <CardDescription>Distribución de vehículos por año</CardDescription>
        </CardHeader>
        <CardContent className="text-center p-8 text-red-600">
          Error al cargar los datos
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChartIcon className="h-5 w-5 mr-2 text-primary" />
          Distribución por Año
        </CardTitle>
        <CardDescription>Distribución de vehículos por año</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884D8" name="Cantidad" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function MostCompatibleVehicles({ timeRange }: { timeRange: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/analytics/vehicles/most-compatible', timeRange],
    queryFn: () => apiRequest('GET', `/api/analytics/vehicles?type=most-compatible&timeRange=${timeRange}`).then(res => res.json()),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vehículos Más Compatibles</CardTitle>
          <CardDescription>Vehículos con mayor número de productos compatibles</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[300px]">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vehículos Más Compatibles</CardTitle>
          <CardDescription>Vehículos con mayor número de productos compatibles</CardDescription>
        </CardHeader>
        <CardContent className="text-center p-8 text-red-600">
          Error al cargar los datos
        </CardContent>
      </Card>
    );
  }

  // Transformar datos para el gráfico
  const chartData = data?.map((vehicle: any) => ({
    name: `${vehicle.year} ${vehicle.make} ${vehicle.model}`.length > 20 
      ? `${vehicle.year} ${vehicle.make} ${vehicle.model}`.substring(0, 20) + '...' 
      : `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
    value: vehicle.compatibilityCount
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChartIcon className="h-5 w-5 mr-2 text-primary" />
          Vehículos Más Compatibles
        </CardTitle>
        <CardDescription>Vehículos con mayor número de productos compatibles</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip />
              <Bar dataKey="value" fill="#82CA9D" name="Compatibilidades" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function MostSearchedVehicles({ timeRange }: { timeRange: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/analytics/vehicles/most-searched', timeRange],
    queryFn: () => apiRequest('GET', `/api/analytics/vehicles?type=most-searched&timeRange=${timeRange}`).then(res => res.json()),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vehículos Más Buscados</CardTitle>
          <CardDescription>Vehículos con mayor número de búsquedas</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[300px]">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vehículos Más Buscados</CardTitle>
          <CardDescription>Vehículos con mayor número de búsquedas</CardDescription>
        </CardHeader>
        <CardContent className="text-center p-8 text-red-600">
          Error al cargar los datos
        </CardContent>
      </Card>
    );
  }

  // Transformar datos para el gráfico
  const chartData = data?.map((vehicle: any) => ({
    name: `${vehicle.year} ${vehicle.make} ${vehicle.model}`.length > 20 
      ? `${vehicle.year} ${vehicle.make} ${vehicle.model}`.substring(0, 20) + '...' 
      : `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
    value: vehicle.searchCount
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChartIcon className="h-5 w-5 mr-2 text-primary" />
          Vehículos Más Buscados
        </CardTitle>
        <CardDescription>Vehículos con mayor número de búsquedas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip />
              <Bar dataKey="value" fill="#A367DC" name="Búsquedas" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}