import ExtraerPDF from '@/app/components//ExtraerTexto';
import { TabView, TabPanel } from 'primereact/tabview';
        

export default function ProyectosPage() {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white shadow-md rounded-lg p-6">
    <TabView>
    <TabPanel header="Lista de Proyecto">
    <ExtraerPDF />
    </TabPanel>
</TabView>
      </div>
    </div>
  );
}

