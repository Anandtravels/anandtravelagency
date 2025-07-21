import { PackageService } from '@/services/packageService';
import { PackageFormData } from '@/types/package';

// Test utility to verify real-time package updates
export const testRealTimePackages = async () => {
  const samplePackage: PackageFormData = {
    title: `Test Package - ${new Date().toLocaleTimeString()}`,
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800'
    ],
    days: '3N/4D',
    price: 25999,
    location: 'Test Location',
    category: 'domestic' as const,
    overview: 'This is a test package to verify real-time updates are working correctly.',
    highlights: [
      'Real-time testing',
      'Automatic updates',
      'Firebase integration'
    ],
    inclusions: [
      'Test accommodation',
      'Test meals',
      'Test transportation'
    ],
    exclusions: [
      'Personal expenses',
      'Additional activities'
    ],
    itinerary: [
      {
        day: '1',
        title: 'Arrival Day',
        description: 'Test arrival and check-in. Activities include check-in and welcome drink.'
      },
      {
        day: '2',
        title: 'Exploration Day',
        description: 'Test exploration activities including sightseeing and local cuisine.'
      }
    ],
    maxPeople: 6,
    duration: '4 days',
    departureInfo: 'Test departure information',
    minAge: 18,
    featured: true,
    status: 'active' as const
  };

  try {
    console.log('Creating test package...');
    const packageId = await PackageService.createPackage(samplePackage, 'test@admin.com');
    console.log(`Test package created with ID: ${packageId}`);
    console.log('Check your website - the package should appear immediately!');
    
    // Wait 5 seconds then update the package
    setTimeout(async () => {
      try {
        console.log('Updating test package...');
        await PackageService.updatePackage(packageId, {
          title: `Updated Test Package - ${new Date().toLocaleTimeString()}`,
          price: 29999
        }, 'test@admin.com');
        console.log('Test package updated! Check your website for the changes.');
      } catch (error) {
        console.error('Error updating test package:', error);
      }
    }, 5000);

    return packageId;
  } catch (error) {
    console.error('Error creating test package:', error);
    throw error;
  }
};

// Function to clean up test packages
export const cleanupTestPackages = async () => {
  try {
    const allPackages = await PackageService.getAllPackages();
    const testPackages = allPackages.filter(pkg => 
      pkg.title.includes('Test Package') || pkg.location === 'Test Location'
    );

    console.log(`Found ${testPackages.length} test packages to clean up`);
    
    for (const pkg of testPackages) {
      await PackageService.deletePackage(pkg.id);
      console.log(`Deleted test package: ${pkg.title}`);
    }
    
    console.log('Test package cleanup completed!');
  } catch (error) {
    console.error('Error cleaning up test packages:', error);
    throw error;
  }
};

// Make functions available in browser console for testing
if (typeof window !== 'undefined') {
  (window as any).testRealTimePackages = testRealTimePackages;
  (window as any).cleanupTestPackages = cleanupTestPackages;
}
