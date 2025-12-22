import React from 'react';
import { createRoot } from 'react-dom/client';
import { Popup } from './Popup';
import { SocialProof } from './SocialProof';
import { supabase } from '../lib/supabase';

const init = async () => {
    // Get store_id from script tag
    const script = document.currentScript as HTMLScriptElement;
    const url = new URL(script.src);
    const storeId = url.searchParams.get('store_id');

    if (!storeId) {
        console.error('Conversion Toolkit: store_id is missing in script tag.');
        return;
    }

    // Create container
    const container = document.createElement('div');
    container.id = 'conversion-toolkit-root';
    document.body.appendChild(container);

    // Fetch configs from Supabase
    const { data: configs, error } = await supabase
        .from('widget_configs' as any)
        .select('*')
        .eq('store_id', storeId)
        .eq('is_active', true);

    if (error) {
        console.error('Conversion Toolkit: Failed to fetch configs.', error);
        return;
    }

    const root = createRoot(container);

    const popupConfig = configs?.find((c: any) => c.type === 'popup');
    const socialProofConfig = configs?.find((c: any) => c.type === 'social_proof');

    root.render(
        <React.StrictMode>
            {popupConfig && <Popup settings={popupConfig.settings} />}
            {socialProofConfig && <SocialProof storeId={storeId} settings={socialProofConfig.settings} />}
        </React.StrictMode>
    );
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
