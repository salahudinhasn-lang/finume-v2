import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createFolder, renameFileOrFolder } from '@/lib/drive';

// GET /api/users/[id]
export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const id = params.id;
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                clientProfile: { include: { permissions: true } },
                expertProfile: true,
                adminProfile: true
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Flatten for frontend
        const { passwordHash, clientProfile, expertProfile, adminProfile, ...baseUser } = user;
        let finalUser: any = { ...baseUser };

        if (user.role === 'CLIENT' && clientProfile) {
            finalUser = { ...finalUser, ...clientProfile, role: 'CLIENT' };
        } else if (user.role === 'EXPERT' && expertProfile) {
            finalUser = { ...finalUser, ...expertProfile, role: 'EXPERT' };
        } else if (user.role === 'ADMIN' && adminProfile) {
            finalUser = { ...finalUser, ...adminProfile, role: 'ADMIN' };
        }

        return NextResponse.json(finalUser);
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// PATCH /api/users/[id]
export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const id = params.id;
        const body = await request.json();
        const { password, ...updates } = body;

        // Split data into User (Auth/Common) and Profile (Client/Expert/Admin)
        // Common User fields that can be updated
        const { name, email, mobileNumber, avatarUrl, ...profileData } = updates;

        let userUpdateData: any = {};
        if (name) userUpdateData.name = name;
        if (email) userUpdateData.email = email;
        if (mobileNumber) userUpdateData.mobileNumber = mobileNumber;
        if (avatarUrl) userUpdateData.avatarUrl = avatarUrl;

        // Handle Password
        if (password) {
            if (password.length < 6) {
                return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
            }
            userUpdateData.passwordHash = await bcrypt.hash(password, 10);
        }

        // Determine Profile update based on ID prefix
        const lowerId = id.toLowerCase();
        if (lowerId.startsWith('cus-')) {
            // Client Update
            userUpdateData.clientProfile = {
                update: {
                    ...profileData,
                    permissions: profileData.permissions ? { update: profileData.permissions } : undefined
                }
            };
        } else if (lowerId.startsWith('exp-')) {
            // Expert Update
            // Handle specializations JSON if needed
            // Handle specializations JSON if needed
            const { specializations, status, ...expertFields } = profileData;

            // Sync User.isActive with Expert.status
            if (status === 'ACTIVE') {
                userUpdateData.isActive = true;
            } else if (status === 'SUSPENDED' || status === 'REJECTED' || status === 'VETTING') {
                userUpdateData.isActive = false;
            }

            userUpdateData.expertProfile = {
                update: {
                    ...expertFields,
                    status: status,
                    specializations: specializations
                }
            };
        } else if (lowerId.startsWith('adm-')) {
            userUpdateData.adminProfile = {
                update: profileData
            };
        }



        // ... existing imports ...

        // ... inside PATCH ...

        const updatedUser = await prisma.user.update({
            where: { id },
            data: userUpdateData,
            include: {
                clientProfile: { include: { permissions: true } },
                expertProfile: true,
                adminProfile: true
            }
        });

        // --- Post-Update Actions ---
        // 1. Rename Drive Folder if Company Name Changed
        if (updatedUser.role === 'CLIENT' && updatedUser.clientProfile?.companyName && updatedUser.googleDriveFolderId) {
            const newName = updatedUser.clientProfile.companyName.replace(/[\/\\\\]/g, '-');
            // We don't strictly know if it *changed* without comparing to old, but renaming to the same name is harmless and safer than an extra DB read.
            // Or we could check if profileData.companyName was present in the request.
            if (profileData.companyName) {
                console.log(`Renaming Drive folder ${updatedUser.googleDriveFolderId} to ${newName}`);
                await renameFileOrFolder(updatedUser.googleDriveFolderId, newName);
            }
        }
        // ---------------------------

        // Flatten response
        const { passwordHash, clientProfile, expertProfile, adminProfile, ...baseUser } = updatedUser;
        // ... rest of response logic ...
        let finalUser: any = { ...baseUser };

        if (updatedUser.role === 'CLIENT' && clientProfile) {
            finalUser = { ...finalUser, ...clientProfile, role: 'CLIENT' };
        } else if (updatedUser.role === 'EXPERT' && expertProfile) {
            finalUser = { ...finalUser, ...expertProfile, role: 'EXPERT' };
        } else if (updatedUser.role === 'ADMIN' && adminProfile) {
            finalUser = { ...finalUser, ...adminProfile, role: 'ADMIN' };
        }

        return NextResponse.json(finalUser);

    } catch (error) {
        console.error('Failed to update user:', error);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}
