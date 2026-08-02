import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { uploadImageToImgBB } from '../lib/imgbb';
import { useNavigate } from 'react-router-dom';

interface Profile {
    full_name: string;
    phone: string;
    date_of_birth: string;
    address: string;
    avatar_url: string;
}

export const ProfilePage = () => {
    const { user, refreshProfile } = useAuth();
    const [profile, setProfile] = useState<Profile>({
        full_name: '',
        phone: '',
        date_of_birth: '',
        address: '',
        avatar_url: '',
    });
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imgBbKey, setImgBbKey] = useState(import.meta.env.VITE_IMGBB_API_KEY || '');
    const [showImgBbInput, setShowImgBbInput] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await api.get('/auth/me');
            if (data?.user) {
                setUserEmail(data.user.email);
                setProfile({
                    full_name: data.user.full_name || '',
                    phone: data.user.phone || '',
                    date_of_birth: data.user.date_of_birth || '',
                    address: data.user.address || '',
                    avatar_url: data.user.avatar_url || '',
                });
            }
        } catch (err: any) {
            console.error('Error fetching profile:', err);
            navigate('/login');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        if (!imgBbKey) {
            setShowImgBbInput(true);
            return;
        }

        setError(null);
        setUploading(true);
        try {
            const file = e.target.files[0];
            const url = await uploadImageToImgBB(file, imgBbKey);
            setProfile({ ...profile, avatar_url: url });
        } catch (err: any) {
            setError('Failed to upload image: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await api.put('/auth/profile', profile);
            await refreshProfile();
            alert('Profile updated successfully!');
        } catch (err: any) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !profile.full_name && !userEmail) {
        return <div className="text-center mt-20">Loading profile...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md border border-slate-100">
            <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-primary" onClick={() => navigate(-1)}>
                &larr; Back
            </Button>
            <h2 className="text-2xl font-bold mb-6 text-primary">My Profile</h2>

            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 font-medium text-sm rounded">{error}</div>}

            <div className="mb-6 flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-slate-200 overflow-hidden mb-4 border-2 border-slate-300">
                    {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <div className="flex items-center justify-center w-full h-full text-slate-400 text-xs">No Img</div>
                    )}
                </div>

                {showImgBbInput && (
                    <div className="mb-2 w-full max-w-xs">
                        <Input
                            label="ImgBB API Key (Required for upload)"
                            value={imgBbKey}
                            onChange={(e) => setImgBbKey(e.target.value)}
                            placeholder="Enter your API Key"
                        />
                        <p className="text-xs text-slate-500 mt-1">Get one at <a href="https://api.imgbb.com/" target="_blank" rel="noreferrer" className="underline">api.imgbb.com</a></p>
                    </div>
                )}

                <div className="relative">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="avatar-upload"
                        disabled={uploading}
                    />
                    <label
                        htmlFor="avatar-upload"
                        className={`cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-md text-sm font-medium transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {uploading ? 'Uploading...' : 'Change Profile Picture'}
                    </label>
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Full Name"
                        name="full_name"
                        value={profile.full_name || ''}
                        onChange={handleChange}
                    />
                    <Input
                        label="Email"
                        value={userEmail || user?.email || ''}
                        disabled
                        className="bg-slate-50"
                    />
                    <Input
                        label="Phone Number"
                        name="phone"
                        value={profile.phone || ''}
                        onChange={handleChange}
                        placeholder="+1 234 567 8900"
                    />
                    <Input
                        label="Date of Birth"
                        type="date"
                        name="date_of_birth"
                        value={profile.date_of_birth || ''}
                        onChange={handleChange}
                    />
                </div>

                <Input
                    label="Address"
                    name="address"
                    value={profile.address || ''}
                    onChange={handleChange}
                />

                <div className="pt-4">
                    <Button type="submit" isLoading={loading}>
                        Save Changes
                    </Button>
                </div>
            </form>
        </div>
    );
};
