
<h3 align="center">
  <a href="https://github.com/s0md3v/dishtance"><img src="dishtance.png" alt="dishtance logo" width="20%"></a>
</h3>

Do you want to find out where a photo/video was shot and there's satellite dish in it? Dishtance can help.

It takes north/azimuth and elevation angles as input and caculates the region(s) to satisfy your search. It allows you to narrow down your search by selecting bands, countries and satellites.
It displays the results on the world map as follow which can be downloaded as a `.kml` file to be viewed in Google Earth etc.

<img src="https://github.com/user-attachments/assets/bb79cfd6-2feb-4c86-a929-1a06fbfaecfb" alt="dishtance demo">

### How does it work?
I have explained this well in [my blog](https://s0md3v.github.io/blog/geolocating-satellite-dishes). In brief, it "reverses" the caculations we do to set up satellite dishes and thus finds out the region(s) the dish must be in based on the inputs.

### How do I install it?
It doesn't need to be installed. Just clone/download this git repository and open the `index.html` file via your browser.

Alternatively, you can simply use it on [s0md3v.github.io/dishtance](https://s0md3v.github.io/dishtance). This software is open source (including its third party components) and will not save/track your inputs.

### How do I use it?
> Note: The output is as precise as the input you give to it. Try to narrow down your inputs (especially the satellite) and dishtance will narrow down the output.

If you don't know what elevation or noth/azimuth angle is in context of satellite dishes, refer to [this resource](https://www.satsig.net/azelhelp.htm) or google it.

1. Measure the elevation angle of the dish. Input a range if you can't be certain e.g. `44-60`
2. Measure the true north/azimuth angle, use a range if needed.
3. Do you see a logo on the dish? Find out which satellite(s) that brand is affiliated with and select it. This can be done with google (or google lens) or [lyngsat.com](https://www.lyngsat.com).
4. You can limit the search to specific ountries if possible.
5. The search can be limited to bands of your choice if that information can be deduced from the context.
6. Once you have entered the data, click on "Calculate Location" and the result should show up on the map. If you have selected "I don't know" in the satellites menu, the software will process 300+ satellites which may take up to 20 seconds depending on your hardware.

The regions displayed on the map can be modified using the controls sidebar. "Export to KML" button lets you download a `.kml` file which can be imported into Google Earth and similar software.

### Disclaimer
The software is not "guessing" anything, its using mathematics. There could be edge cases I am not aware of or inaccuracies in the third party coverage data. Trust but verify.
