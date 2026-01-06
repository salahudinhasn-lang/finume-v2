
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
    try {
        let settings = await prisma.platformSettings.findUnique({
            where: { id: 'global' }
        });

        if (!settings) {
            settings = await prisma.platformSettings.create({
                data: {
                    id: 'global',
                    showExpertsPage: false,
                    showServicesPage: false,
                    careersEnabled: false,
                    sitePages: JSON.stringify([
                        { id: 'about', slug: '/about', title: 'About Us', section: 'COMPANY', isSystem: true, showPublic: true, showClient: true },
                        { id: 'careers', slug: '/careers', title: 'Careers', section: 'COMPANY', isSystem: true, showPublic: true, showClient: false },
                        { id: 'contact', slug: '/contact', title: 'Contact', section: 'COMPANY', isSystem: true, showPublic: true, showClient: true },
                        { id: 'help-center', slug: '/qa', title: 'Help Center', section: 'RESOURCES', isSystem: true, showPublic: true, showClient: true },
                        { id: 'zatca-guide', slug: '/compliance', title: 'ZATCA Guide', section: 'RESOURCES', isSystem: true, showPublic: true, showClient: true },
                        { id: 'api-docs', slug: '#', title: 'API Documentation', section: 'RESOURCES', isSystem: false, showPublic: true, showClient: false },
                        { id: 'privacy', slug: '/privacy', title: 'Privacy Policy', section: 'LEGAL', isSystem: true, showPublic: true, showClient: true },
                        { id: 'terms', slug: '/terms', title: 'Terms of Service', section: 'LEGAL', isSystem: true, showPublic: true, showClient: true }
                    ])
                }
            });
        } else if (!settings.sitePages) {
            // Migration: Populate default pages if missing in existing record
            const defaultPages = [
                { id: 'about', slug: '/about', title: 'About Us', section: 'COMPANY', isSystem: true, showPublic: true, showClient: true },
                { id: 'careers', slug: '/careers', title: 'Careers', section: 'COMPANY', isSystem: true, showPublic: true, showClient: false },
                { id: 'contact', slug: '/contact', title: 'Contact', section: 'COMPANY', isSystem: true, showPublic: true, showClient: true },
                { id: 'help-center', slug: '/qa', title: 'Help Center', section: 'RESOURCES', isSystem: true, showPublic: true, showClient: true },
                { id: 'zatca-guide', slug: '/compliance', title: 'ZATCA Guide', section: 'RESOURCES', isSystem: true, showPublic: true, showClient: true },
                { id: 'api-docs', slug: '#', title: 'API Documentation', section: 'RESOURCES', isSystem: false, showPublic: true, showClient: false },
                { id: 'privacy', slug: '/privacy', title: 'Privacy Policy', section: 'LEGAL', isSystem: true, showPublic: true, showClient: true },
                { id: 'terms', slug: '/terms', title: 'Terms of Service', section: 'LEGAL', isSystem: true, showPublic: true, showClient: true }
            ];
            
            settings = await prisma.platformSettings.update({
                where: { id: 'global' },
                data: { sitePages: JSON.stringify(defaultPages) }
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const settings = await prisma.platformSettings.upsert({
            where: { id: 'global' },
            update: body,
            create: {
                id: 'global',
                ...body
            }
        });
        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
