'use client';

/**
 * CardView Component
 * Renders a public card with analytics tracking
 */

import { useEffect } from 'react';
import { trackAnalyticsEvent } from '@/lib/analytics-client';

interface CardViewProps {
  card: {
    id: string;
    slug: string;
    title: string | null;
    data: any;
    brandingHidden: boolean;
    publicUrl: string | null;
    qrCodeUrl: string | null;
  };
}

export default function CardView({ card }: CardViewProps) {
  const cardData = card.data || {};
  const personal = cardData.personal || {};
  const social = cardData.social || [];
  const links = cardData.links || [];
  const stats = cardData.stats || {};

  // Track view on mount
  useEffect(() => {
    trackAnalyticsEvent(card.id, 'view', {
      source: 'direct',
      referrer: document.referrer,
    });
  }, [card.id]);

  const handleLinkClick = (linkId: string, url: string) => {
    trackAnalyticsEvent(card.id, 'link_click', {
      linkId,
      url,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header / Profile Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white text-center">
            {personal.profileImage && (
              <div className="mb-4">
                <img
                  src={personal.profileImage}
                  alt={`${personal.firstName} ${personal.lastName}`}
                  className="w-32 h-32 rounded-full mx-auto border-4 border-white shadow-lg object-cover"
                />
              </div>
            )}
            
            <h1 className="text-3xl font-bold mb-2">
              {personal.firstName} {personal.lastName}
            </h1>
            
            {personal.jobTitle && (
              <p className="text-xl opacity-90 mb-1">{personal.jobTitle}</p>
            )}
            
            {personal.company && (
              <p className="text-lg opacity-80">{personal.company}</p>
            )}
          </div>

          {/* Bio Section */}
          {personal.bio && (
            <div className="p-6 border-b">
              <p className="text-gray-700 leading-relaxed">{personal.bio}</p>
            </div>
          )}

          {/* Contact Info */}
          {(personal.email || personal.phone || personal.website) && (
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Contact</h2>
              <div className="space-y-2">
                {personal.email && (
                  <a
                    href={`mailto:${personal.email}`}
                    className="flex items-center text-blue-600 hover:text-blue-700"
                    onClick={() => handleLinkClick('email', personal.email)}
                  >
                    <span className="mr-2">📧</span>
                    {personal.email}
                  </a>
                )}
                
                {personal.phone && (
                  <a
                    href={`tel:${personal.phone}`}
                    className="flex items-center text-blue-600 hover:text-blue-700"
                    onClick={() => handleLinkClick('phone', personal.phone)}
                  >
                    <span className="mr-2">📱</span>
                    {personal.phone}
                  </a>
                )}
                
                {personal.website && (
                  <a
                    href={personal.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-700"
                    onClick={() => handleLinkClick('website', personal.website)}
                  >
                    <span className="mr-2">🌐</span>
                    {personal.website}
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Social Media */}
          {social.length > 0 && (
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Connect</h2>
              <div className="flex flex-wrap gap-3">
                {social.map((item: any, index: number) => (
                  <a
                    key={index}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    onClick={() => handleLinkClick(`social-${index}`, item.url)}
                  >
                    {item.platform}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Custom Links */}
          {links.filter((link: any) => link.visible).length > 0 && (
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Links</h2>
              <div className="space-y-3">
                {links
                  .filter((link: any) => link.visible)
                  .sort((a: any, b: any) => a.order - b.order)
                  .map((link: any) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                      onClick={() => handleLinkClick(link.id, link.url)}
                    >
                      <div className="font-medium text-gray-900">{link.title}</div>
                      {link.description && (
                        <div className="text-sm text-gray-600 mt-1">{link.description}</div>
                      )}
                    </a>
                  ))}
              </div>
            </div>
          )}

          {/* Stats */}
          {(stats.projects || stats.awards || stats.experience) && (
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Stats</h2>
              <div className="grid grid-cols-3 gap-4">
                {stats.projects && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.projects}</div>
                    <div className="text-sm text-gray-600">Projects</div>
                  </div>
                )}
                {stats.awards && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.awards}</div>
                    <div className="text-sm text-gray-600">Awards</div>
                  </div>
                )}
                {stats.experience && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.experience}</div>
                    <div className="text-sm text-gray-600">Experience</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Branding */}
          {!card.brandingHidden && (
            <div className="p-4 text-center text-sm text-gray-500">
              Made with <span className="text-red-500">♥</span> using Skafolio
            </div>
          )}
        </div>

        {/* QR Code Section */}
        {card.qrCodeUrl && (
          <div className="mt-6 text-center">
            <div className="inline-block p-4 bg-white rounded-lg shadow-lg">
              <img src={card.qrCodeUrl} alt="QR Code" className="w-32 h-32" />
              <p className="text-xs text-gray-600 mt-2">Scan to share</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
