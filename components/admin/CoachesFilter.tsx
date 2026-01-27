'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, X } from 'lucide-react';
import { NICHES } from '@/lib/types';

interface CoachesFilterProps {
    onFilterChange: (filters: {
        search: string;
        niche: string;
    }) => void;
}

export default function CoachesFilter({ onFilterChange }: CoachesFilterProps) {
    const [search, setSearch] = useState('');
    const [niche, setNiche] = useState('');

    const handleApplyFilters = () => {
        onFilterChange({ search, niche });
    };

    const handleClearFilters = () => {
        setSearch('');
        setNiche('');
        onFilterChange({ search: '', niche: '' });
    };

    return (
        <Card className='overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/20'>
            <CardContent className='p-4'>
                <div className='grid gap-4 md:grid-cols-3'>
                    <div>
                        <Label htmlFor='search' className='text-foreground'>Search</Label>
                        <div className='relative mt-1'>
                            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                            <Input
                                id='search'
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder='Username or name...'
                                className='pl-10 border-border bg-background text-foreground'
                                onKeyPress={(e) => e.key === 'Enter' && handleApplyFilters()}
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor='niche' className='text-foreground'>Niche</Label>
                        <Select value={niche} onValueChange={setNiche}>
                            <SelectTrigger className='mt-1 border-border bg-background text-foreground'>
                                <SelectValue placeholder='All niches' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value=''>All niches</SelectItem>
                                {NICHES.map((n) => (
                                    <SelectItem key={n} value={n}>
                                        {n}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className='flex items-end gap-2'>
                        <Button onClick={handleApplyFilters} className='flex-1 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors'>
                            <Search className='mr-2 h-4 w-4' />
                            Apply
                        </Button>
                        <Button
                            onClick={handleClearFilters}
                            variant='outline'
                            className='flex-1 border-border hover:bg-accent hover:text-accent-foreground transition-colors'
                        >
                            <X className='mr-2 h-4 w-4' />
                            Clear
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
