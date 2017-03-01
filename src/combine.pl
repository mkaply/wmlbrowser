#!/usr/local/bin/perl -w
use strict;
use Archive::Zip qw( :ERROR_CODES :CONSTANTS );

# Combine the binary extensions of the Windows and Linux
# versions of wbmpviewer into a single extension.
# Sample usage: 
# perl combine.pl wbmpviewer-0.2.7.xpi wbmpviewer-0.2.7-win.xpi wbmpviewer-0.2.7-linux.xpi

my $output = shift or die; # Output file to write to

my $combined = Archive::Zip->new();

my $temp = "temp.$$";
mkdir $temp or die $!;

my $added_rdf = 0; # have we added install.rdf yet?

while (my $input = shift)
{
    print "$input\n";
    my $xpi = Archive::Zip->new();
    unless ( $xpi->read( $input ) == AZ_OK ) {
        die 'read error on $input';
    }
    my @members = $xpi->memberNames();
    foreach my $member (@members)
    {
        if ($member eq 'install.rdf')
        {
            if ($added_rdf == 0)
            {
                print "Adding $member\n";
                $xpi->extractMemberWithoutPaths ($member, "$temp/$member");
                $combined->addFile ("$temp/$member", $member);
                $added_rdf = 1;
            }
        }
        elsif ($member =~ /dll$/)
        {
            print "Adding $member\n";
            $xpi->extractMemberWithoutPaths ($member, "$temp/platform/WINNT_x86-msvc/$member");
            $combined->addFile ("$temp/platform/WINNT_x86-msvc/$member", "platform/WINNT_x86-msvc/$member");
        }
        elsif ($member =~ /so$/)
        {
            print "Adding $member\n";
            $xpi->extractMemberWithoutPaths ($member, "$temp/platform/Linux_x86-gcc3/$member");
            $combined->addFile ("$temp/platform/Linux_x86-gcc3/$member", "platform/Linux_x86-gcc3/$member");
        }
    }

}

# Save the Zip file
unless ( $combined->writeToFileNamed($output) == AZ_OK ) {
    die 'write error';
}

system ("rm -r $temp");
