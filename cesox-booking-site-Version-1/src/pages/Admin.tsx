import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Trash2, Plus, Edit2, Save, X, ArrowLeft, Lock, Eye, EyeOff, LogOut, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Booking {
  id: string;
  customer_name: string;
  customer_phone: string;
  service_name: string;
  service_price: string;
  barber_name: string;
  booking_date: string;
  booking_time: string;
  status: string;
  created_at: string;
}

interface Barber {
  id: string;
  name: string;
  is_active: boolean;
}

interface Service {
  id: string;
  name: string;
  price: string;
  description?: string | null;
  duration?: string | null;
  is_active: boolean;
}

const Admin = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!sessionStorage.getItem('adminToken');
  });

  // Login form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [activeTab, setActiveTab] = useState<'pending' | 'bookings' | 'barbers' | 'services'>('pending');
  // Data states
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [supportsServiceDetails, setSupportsServiceDetails] = useState(true);
  
  // Edit states
  const [editingBarber, setEditingBarber] = useState<string | null>(null);
  const [editingService, setEditingService] = useState<string | null>(null);
  const [newBarberName, setNewBarberName] = useState("");
  const [newServiceName, setNewServiceName] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");
  const [newServiceDescription, setNewServiceDescription] = useState("");
  const [newServiceDuration, setNewServiceDuration] = useState("");
  const [editBarberName, setEditBarberName] = useState("");
  const [editServiceName, setEditServiceName] = useState("");
  const [editServicePrice, setEditServicePrice] = useState("");
  const [editServiceDescription, setEditServiceDescription] = useState("");
  const [editServiceDuration, setEditServiceDuration] = useState("");

  // Helper function for admin API calls
  const adminFetch = async (operation: string, table: string, data?: any, id?: string) => {
    const token = sessionStorage.getItem('adminToken');
    if (!token) {
      setIsAuthenticated(false);
      return { data: null, error: { message: 'Not authenticated' } };
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-operations`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          'x-admin-token': token,
        },
        body: JSON.stringify({ operation, table, data, id }),
      }
    );

    const result = await response.json();
    
    if (!response.ok || result.error) {
      return { data: null, error: { message: result.error || 'Operation failed' } };
    }

    return { data: result.data, error: null };
  };

  // Fetch data when admin is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
      fetchBarbers();
      fetchServices();
    }
  }, [isAuthenticated]);

  const fetchBookings = async () => {
    const { data, error } = await adminFetch('select', 'bookings');
    if (error) {
      toast({ title: "Error fetching bookings", variant: "destructive" });
      return;
    }
    setBookings(data || []);
  };

  const fetchBarbers = async () => {
    const { data, error } = await adminFetch('select', 'barbers');
    if (error) {
      toast({ title: "Error fetching barbers", variant: "destructive" });
      return;
    }
    setBarbers(data || []);
  };

  const fetchServices = async () => {
    const { data, error } = await adminFetch('select', 'services');
    if (error) {
      toast({ title: "Error fetching services", variant: "destructive" });
      return;
    }
    const servicesData = data || [];
    if (servicesData.length > 0) {
      setSupportsServiceDetails(
        "description" in servicesData[0] || "duration" in servicesData[0]
      );
    }
    setServices(servicesData);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ username, password }),
        }
      );

      const result = await response.json();

      if (!response.ok || result.error) {
        setLoginError(result.error || "Login failed");
        setIsLoggingIn(false);
        return;
      }

      sessionStorage.setItem('adminToken', result.token);
      setIsAuthenticated(true);
      toast({ title: "Welcome, Admin!" });
    } catch (err) {
      setLoginError("An error occurred. Please try again.");
    } finally {
      setIsLoggingIn(false);
      setPassword("");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    navigate('/');
  };

  const deleteBooking = async (id: string) => {
    const { error } = await adminFetch('delete', 'bookings', null, id);
    if (error) {
      toast({ title: "Error deleting booking", variant: "destructive" });
      return;
    }
    toast({ title: "Booking deleted" });
    fetchBookings();
  };

  const updateBookingStatus = async (id: string, status: string) => {
    const { error } = await adminFetch('update', 'bookings', { status }, id);
    if (error) {
      toast({ title: "Error updating booking", variant: "destructive" });
      return;
    }
    toast({ title: "Booking updated" });
    fetchBookings();
  };

  // Barber CRUD
  const addBarber = async () => {
    if (!newBarberName.trim()) return;
    const { error } = await adminFetch('insert', 'barbers', { name: newBarberName.trim() });
    if (error) {
      toast({ title: "Error adding barber", variant: "destructive" });
      return;
    }
    toast({ title: "Barber added" });
    setNewBarberName("");
    fetchBarbers();
  };

  const updateBarber = async (id: string) => {
    if (!editBarberName.trim()) return;
    const { error } = await adminFetch('update', 'barbers', { name: editBarberName.trim() }, id);
    if (error) {
      toast({ title: "Error updating barber", variant: "destructive" });
      return;
    }
    toast({ title: "Barber updated" });
    setEditingBarber(null);
    fetchBarbers();
  };

  const toggleBarberActive = async (id: string, isActive: boolean) => {
    const { error } = await adminFetch('update', 'barbers', { is_active: !isActive }, id);
    if (error) {
      toast({ title: "Error updating barber", variant: "destructive" });
      return;
    }
    fetchBarbers();
  };

  const deleteBarber = async (id: string) => {
    const { error } = await adminFetch('delete', 'barbers', null, id);
    if (error) {
      toast({ title: "Error deleting barber", variant: "destructive" });
      return;
    }
    toast({ title: "Barber deleted" });
    fetchBarbers();
  };

  // Service CRUD
  const addService = async () => {
    if (!newServiceName.trim() || !newServicePrice.trim()) return;
    const payload: Record<string, string | null> = {
      name: newServiceName.trim(),
      price: newServicePrice.trim(),
    };
    if (supportsServiceDetails) {
      payload.description = newServiceDescription.trim() || null;
      payload.duration = newServiceDuration.trim() || null;
    }
    const { error } = await adminFetch('insert', 'services', payload);
    if (error) {
      toast({ title: "Error adding service", variant: "destructive" });
      return;
    }
    toast({ title: "Service added" });
    setNewServiceName("");
    setNewServicePrice("");
    setNewServiceDescription("");
    setNewServiceDuration("");
    fetchServices();
  };

  const updateService = async (id: string) => {
    if (!editServiceName.trim() || !editServicePrice.trim()) return;
    const payload: Record<string, string | null> = {
      name: editServiceName.trim(),
      price: editServicePrice.trim(),
    };
    if (supportsServiceDetails) {
      payload.description = editServiceDescription.trim() || null;
      payload.duration = editServiceDuration.trim() || null;
    }
    const { error } = await adminFetch('update', 'services', payload, id);
    if (error) {
      toast({ title: "Error updating service", variant: "destructive" });
      return;
    }
    toast({ title: "Service updated" });
    setEditingService(null);
    fetchServices();
  };

  const deleteService = async (id: string) => {
    const { error } = await adminFetch('delete', 'services', null, id);
    if (error) {
      toast({ title: "Error deleting service", variant: "destructive" });
      return;
    }
    toast({ title: "Service deleted" });
    fetchServices();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Not authenticated - show login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="glass-card rounded-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <Lock className="w-12 h-12 text-gold mx-auto mb-4" />
            <h1 className="font-display text-2xl font-bold">Admin Access</h1>
            <p className="text-muted-foreground mt-2">Enter your credentials</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
              />
            </div>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            {loginError && (
              <p className="text-red-500 text-sm text-center">{loginError}</p>
            )}
            
            <Button type="submit" variant="gold" className="w-full" disabled={isLoggingIn}>
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
            
            <Button type="button" variant="ghost" className="w-full" onClick={() => navigate('/')}>
              Go back home
            </Button>
          </form>
        </div>
      </div>
    );
  }

  const pendingBookings = bookings.filter((booking) => booking.status === "pending");

  // Authenticated admin panel
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-display text-3xl font-bold text-gold-gradient">Cesox Salon Admin</h1>
              <p className="text-sm text-muted-foreground">Manage bookings, barbers, and services</p>
            </div>
          </div>
          <Button variant="goldOutline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['pending', 'bookings', 'barbers', 'services'] as const).map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? 'gold' : 'goldOutline'}
              onClick={() => setActiveTab(tab)}
              className="capitalize"
            >
              {tab === "pending" ? `Pending (${pendingBookings.length})` : tab}
            </Button>
          ))}
        </div>

        {/* Pending Tab */}
        {activeTab === 'pending' && (
          <div className="glass-card rounded-xl p-6">
            <h2 className="font-display text-xl font-semibold mb-4">Pending Bookings</h2>
            {pendingBookings.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No pending bookings</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Barber</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">{booking.customer_name}</TableCell>
                        <TableCell>{booking.customer_phone}</TableCell>
                        <TableCell>{booking.service_name} ({booking.service_price})</TableCell>
                        <TableCell>{booking.barber_name}</TableCell>
                        <TableCell>{booking.booking_date}</TableCell>
                        <TableCell>{booking.booking_time}</TableCell>
                        <TableCell>
                          <select
                            value={booking.status}
                            onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                            className="bg-secondary border border-border rounded px-2 py-1 text-sm"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteBooking(booking.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="glass-card rounded-xl p-6">
            <h2 className="font-display text-xl font-semibold mb-4">All Bookings</h2>
            {bookings.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No bookings yet</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Barber</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">{booking.customer_name}</TableCell>
                        <TableCell>{booking.customer_phone}</TableCell>
                        <TableCell>{booking.service_name} ({booking.service_price})</TableCell>
                        <TableCell>{booking.barber_name}</TableCell>
                        <TableCell>{booking.booking_date}</TableCell>
                        <TableCell>{booking.booking_time}</TableCell>
                        <TableCell>
                          <select
                            value={booking.status}
                            onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                            className="bg-secondary border border-border rounded px-2 py-1 text-sm"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteBooking(booking.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}

        {/* Barbers Tab */}
        {activeTab === 'barbers' && (
          <div className="glass-card rounded-xl p-6">
            <h2 className="font-display text-xl font-semibold mb-4">Manage Barbers</h2>
            
            {/* Add new barber */}
            <div className="flex gap-2 mb-6">
              <Input
                value={newBarberName}
                onChange={(e) => setNewBarberName(e.target.value)}
                placeholder="New barber name"
                className="max-w-xs"
              />
              <Button variant="gold" onClick={addBarber}>
                <Plus className="w-4 h-4 mr-2" /> Add
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {barbers.map((barber) => (
                  <TableRow key={barber.id}>
                    <TableCell>
                      {editingBarber === barber.id ? (
                        <Input
                          value={editBarberName}
                          onChange={(e) => setEditBarberName(e.target.value)}
                          className="max-w-xs"
                        />
                      ) : (
                        <span className="font-medium">{barber.name}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant={barber.is_active ? "default" : "secondary"}
                        size="sm"
                        onClick={() => toggleBarberActive(barber.id, barber.is_active)}
                      >
                        {barber.is_active ? 'Active' : 'Inactive'}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {editingBarber === barber.id ? (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => updateBarber(barber.id)}>
                              <Save className="w-4 h-4 text-green-400" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setEditingBarber(null)}>
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingBarber(barber.id);
                                setEditBarberName(barber.name);
                              }}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteBarber(barber.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="glass-card rounded-xl p-6">
            <h2 className="font-display text-xl font-semibold mb-4">Manage Services</h2>

            {/* Add new service */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Input
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                placeholder="Service name"
                className="max-w-xs"
              />
              <Input
                value={newServicePrice}
                onChange={(e) => setNewServicePrice(e.target.value)}
                placeholder="Price (e.g. $35)"
                className="max-w-[120px]"
              />
              {supportsServiceDetails && (
                <>
                  <Input
                    value={newServiceDescription}
                    onChange={(e) => setNewServiceDescription(e.target.value)}
                    placeholder="Description"
                    className="max-w-sm"
                  />
                  <Input
                    value={newServiceDuration}
                    onChange={(e) => setNewServiceDuration(e.target.value)}
                    placeholder="Duration (e.g. 30 min)"
                    className="max-w-[160px]"
                  />
                </>
              )}
              <Button variant="gold" onClick={addService}>
                <Plus className="w-4 h-4 mr-2" /> Add
              </Button>
            </div>
            {!supportsServiceDetails && (
              <p className="text-sm text-muted-foreground mb-4">
                Service descriptions and durations are unavailable. Apply the latest database migration to enable them.
              </p>
            )}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  {supportsServiceDetails && <TableHead>Description</TableHead>}
                  {supportsServiceDetails && <TableHead>Duration</TableHead>}
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>
                      {editingService === service.id ? (
                        <Input
                          value={editServiceName}
                          onChange={(e) => setEditServiceName(e.target.value)}
                          className="max-w-xs"
                        />
                      ) : (
                        <span className="font-medium">{service.name}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingService === service.id ? (
                        <Input
                          value={editServicePrice}
                          onChange={(e) => setEditServicePrice(e.target.value)}
                          className="max-w-[120px]"
                        />
                      ) : (
                        <span className="text-gold">{service.price}</span>
                      )}
                    </TableCell>
                    {supportsServiceDetails && (
                      <TableCell>
                        {editingService === service.id ? (
                          <Input
                            value={editServiceDescription}
                            onChange={(e) => setEditServiceDescription(e.target.value)}
                            className="max-w-sm"
                          />
                        ) : (
                          <span className="text-muted-foreground">{service.description || "—"}</span>
                        )}
                      </TableCell>
                    )}
                    {supportsServiceDetails && (
                      <TableCell>
                        {editingService === service.id ? (
                          <Input
                            value={editServiceDuration}
                            onChange={(e) => setEditServiceDuration(e.target.value)}
                            className="max-w-[160px]"
                          />
                        ) : (
                          <span className="text-muted-foreground">{service.duration || "—"}</span>
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex gap-2">
                        {editingService === service.id ? (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => updateService(service.id)}>
                              <Save className="w-4 h-4 text-green-400" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setEditingService(null)}>
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingService(service.id);
                                setEditServiceName(service.name);
                                setEditServicePrice(service.price);
                                if (supportsServiceDetails) {
                                  setEditServiceDescription(service.description || "");
                                  setEditServiceDuration(service.duration || "");
                                }
                              }}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteService(service.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
