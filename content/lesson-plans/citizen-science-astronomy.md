---
title: "Citizen-Science Astronomy"
tags: [lesson-plan, science]
level: fundamentals
type: moc
reviewed: 2026-09-22
---

Astronomy from naked-eye basics through to contributing real observations that working
scientists use. The destination is not knowing about astronomy, it is having your data in
a dataset somebody published from.

Two things make this unusual among the paths here. The first contributions need no
equipment at all, only a browser, so section 6 is reachable within weeks. And the
equipment decision in section 5 is genuinely consequential, so it comes after you know
what kind of contribution you want to make.

## Objectives

By the end of this path you can:

* Find your way around the sky without a goto mount.
* Read and use equatorial coordinates, and explain why they need an epoch.
* Interpret a stellar spectrum and place a star on the HR diagram.
* Choose equipment for a specific kind of observation rather than for magnification.
* Contribute classifications to a Zooniverse project competently.
* Open FITS data from a public archive and read a light curve.
* Produce calibrated differential photometry and submit it to AAVSO.
* Choose a specialisation where amateur work is scientifically valuable.

## Prerequisites

A dark-ish sky, or a browser if you start at section 6. Some Python helps from section 7.
No physics background assumed, though comfort with logarithms will make magnitudes less
annoying.

## How to use this path

Sections 1 through 5 build the foundation. Section 6 is the first real contribution and
needs nothing but a browser, so it is worth reaching early even if you are still working
through the earlier material.

Each section follows the same rhythm:

* **Focus:** the questions you should be able to answer by the end.
* **Learn:** what to read.
* **Practice:** go outside, or open the data.
* **Self-check:** you are ready to move on when you can do these.
* **Answer:** collapsed, so you can attempt the self-check first.
* **Ask yourself:** heuristics that test understanding rather than recall.

## 1. Orientation

What the field is and how it is organised.

**Focus:** What are the scales involved? What are the sub-fields? Where does astronomical
work actually get published?

**Learn:**
* [NASA: universe scales](https://science.nasa.gov/universe/): the size ladder.
* [arXiv astro-ph](https://arxiv.org/list/astro-ph/recent): where papers appear before journals.

**Practice:** Write the size ladder from Earth to the observable universe from memory, with
a rough order of magnitude for each rung. Then read one arXiv abstract a day for a week
and note which sub-field each belongs to.

**Self-check:** you can give rough scales, name the sub-fields, and describe how research
reaches the world.

> [!question]- Answer
> **The ladder.** Earth at roughly 10⁷ metres, the Solar System at 10¹³, the stellar
> neighbourhood at 10¹⁷, the Milky Way at 10²¹, the Local Group at 10²³, and the
> observable universe at about 10²⁶. Each rung is several orders of magnitude, which is
> why intuition fails and why astronomers work in logarithms.
> **Sub-fields.** Planetary science studies bodies in solar systems. Stellar astrophysics
> studies stars themselves. Galactic astronomy studies our galaxy, extragalactic studies
> others. Cosmology studies the universe as a whole. High-energy astrophysics studies
> violent processes. Astrobiology studies the conditions for life.
> **How it is organised.** Observatories collect, ground-based and space-based. Surveys
> such as Gaia, SDSS, and TESS collect systematically at scale, and they are the reason
> citizen science is possible, because they produce more data than professionals can
> examine. Journals such as ApJ, MNRAS, and A&A publish, and arXiv astro-ph carries
> preprints, usually before the journal version.
> **Why the survey matters to you.** The bottleneck in modern astronomy is not collecting
> data, it is looking at it. That gap is the opening.

**Ask yourself:**
* Which sub-field am I actually drawn to, and does it need observers or analysts?
* What kind of data is being produced faster than anyone can examine it?

## 2. The sky

Finding your way without help.

**Focus:** How do you find a target by star-hopping? What does apparent magnitude mean and
which way does it run?

**Learn:**
* [Stellarium](https://stellarium.org/): free planetarium software, and the single most
  useful tool at this stage.
* [Sky and Telescope's observing guides](https://skyandtelescope.org/observing/): seasonal
  guidance for what is up.

**Practice:** Learn the constellations of your current season at your latitude. Then find
five objects by star-hopping from a known bright star, with no goto and no phone. Estimate
each one's magnitude by eye and check yourself afterwards.

**Self-check:** you can identify the season's constellations, star-hop to a target, and
estimate magnitude by eye.

> [!question]- Answer
> **Constellations against asterisms.** The 88 IAU constellations are regions of sky with
> defined boundaries, not just the star patterns. The Big Dipper is an asterism inside
> Ursa Major, not a constellation. Every point on the sky belongs to exactly one
> constellation, which is why objects are named for the region rather than the pattern.
> **Magnitude.** Logarithmic and inverted: lower means brighter. Five magnitudes is a
> factor of 100 in brightness, so one magnitude is about 2.512. The Sun is around −27, the
> full Moon −13, Venus at its best −4.6, Sirius −1.46, Polaris about +2, and the naked-eye
> limit around +6 under a dark sky, considerably worse in a city.
> **Star-hopping.** Start from a bright star you can find unaided, then move in known
> angular steps using recognisable patterns until you arrive. Your fist at arm's length is
> roughly 10 degrees, a finger width about 1 degree. This is a skill goto mounts let you
> skip and that you will want anyway when the mount is not aligned.
> **Why it is worth learning.** Knowing where things are makes you far faster at deciding
> whether a target is observable tonight, and it is the difference between operating
> equipment and understanding the sky.

**Ask yourself:**
* Can I find anything without electronics, and how far does that reach?
* What is my actual limiting magnitude from where I observe?

## 3. Coordinates, time, and motion

The system everything is catalogued in.

**Focus:** How do right ascension and declination work? Why do constellations rise four
minutes earlier each night? Why does a catalogue state an epoch?

**Learn:**
* [Astropy coordinates](https://docs.astropy.org/en/stable/coordinates/): the practical implementation.
* [IAU on celestial reference systems](https://www.iau.org/): the formal definitions.

**Practice:** Convert a target's RA and Dec into an altitude and azimuth for your location
and tonight's date, first by hand and then with Astropy. Work out which RA is on your
meridian at midnight tonight.

**Self-check:** you can read equatorial coordinates, explain sidereal time, and say why an
epoch is attached to every catalogue position.

> [!question]- Answer
> **Equatorial coordinates.** Right ascension runs 0 to 24 hours, declination −90 to +90
> degrees. Analogous to longitude and latitude but fixed to the stars rather than to the
> rotating Earth, which is what makes them usable as catalogue addresses.
> **Why hours for RA.** Because the sky rotates once per day, so an hour of RA is the
> amount that crosses the meridian in an hour of sidereal time. It converts directly to
> observing planning.
> **Sidereal against solar time.** A sidereal day is about 3 minutes 56 seconds shorter
> than a solar day, because Earth has to rotate slightly further to face the Sun again
> after moving along its orbit. That difference is exactly why a given star rises four
> minutes earlier each night and why the constellations change with season.
> **Epoch.** Earth's axis precesses over roughly 26,000 years, so coordinates drift.
> Catalogues fix positions to a reference epoch, almost always J2000.0. Comparing a
> J2000 position against an older epoch without converting puts you in the wrong place,
> and the error is large enough to matter at a telescope.
> **Proper motion and radial velocity.** Stars move. Proper motion is drift across the
> sky in milliarcseconds per year; radial velocity is motion along the line of sight in
> kilometres per second. Both matter for anything Gaia-era, and for nearby stars proper
> motion is visible within a human lifetime.

**Ask yourself:**
* If a source moved since the catalogue epoch, would my pointing still find it?
* Which of tonight's targets will actually be above my horizon, and when?

## 4. Light and matter

What you can learn from a spectrum.

**Focus:** Why does colour indicate temperature? What does a spectral line tell you? What
does the HR diagram organise?

**Learn:**
* [Las Cumbres Observatory: spectroscopy](https://lco.global/spacebook/): accessible explanations.
* [ESO on the HR diagram](https://www.eso.org/public/): the diagram and what it encodes.

**Practice:** Look up the spectral type of ten bright stars and place them on a
hand-drawn HR diagram. Predict the colour of each from its type before checking a photo.

**Self-check:** you can explain blackbody colour, read a spectrum, and say what a star's
position on the HR diagram tells you.

> [!question]- Answer
> **Blackbody colour.** Hotter objects peak at shorter wavelengths, so blue stars are hot
> and red stars are cool. This runs against the traffic-light intuition and is the single
> most common beginner reversal.
> **Spectral lines.** Absorption and emission lines encode composition, temperature,
> density, line-of-sight velocity through Doppler shift, and magnetic field through
> Zeeman splitting. Spectroscopy is the most powerful tool in astronomy, because almost
> everything we know about objects we can never visit came from splitting their light.
> **OBAFGKM.** The spectral sequence from hot to cool. O is above 30,000 K and blue, B is
> blue-white, A white, F yellow-white, G yellow like the Sun at 5,800 K, K orange, and M
> red below about 3,500 K. The Sun is G2V, where the V is a luminosity class meaning main
> sequence.
> **The HR diagram.** Temperature on one axis against luminosity on the other. Stars fall
> into a main sequence running hot-bright to cool-faint, plus giant, supergiant, and white
> dwarf regions. Where a star sits tells you its mass, its age, and what it will do next,
> which is why one plot organises most of stellar astrophysics.
> **Why the main sequence exists.** It is where stars spend most of their lives fusing
> hydrogen, so at any moment most stars are on it. The sparse regions are sparse because
> stars pass through them quickly.

**Ask yourself:**
* Given a star's colour, what can I infer and what can I not?
* Why is the main sequence a line rather than a scatter?

## 5. Equipment

Choosing for the observation rather than for the specification.

**Focus:** What can each instrument actually see? Which specification matters for
photometry? What do you actually need for the contribution you want to make?

**Learn:**
* [Cloudy Nights equipment forums](https://www.cloudynights.com/): unusually honest amateur reviews.
* [AAVSO: getting started with photometry](https://www.aavso.org/): equipment guidance tied to real submission requirements.

**Practice:** Decide what kind of contribution you want to make, then write down the
minimum equipment for it and the cost. Do this before buying anything. If the answer is
browser-only, skip to section 6 and revisit this later.

**Self-check:** you can justify an equipment choice against a specific observing goal and
explain why magnification is the wrong headline number.

> [!question]- Answer
> **The core point.** For citizen science, aperture and stability matter far more than
> magnification. Most beginner telescopes are marketed on magnification, which is the
> specification that matters least and the easiest to inflate.
> **Binoculars.** A pair of 10x50s on a fixed mount outperforms most cheap telescopes and
> is genuinely useful for variable star work on bright targets. This is the least
> glamorous and most frequently correct answer.
> **Telescope types.** Refractors use a lens, are low-maintenance, and cost more per
> millimetre of aperture. Reflectors use a mirror, give the most aperture per unit cost,
> and need occasional collimation. Catadioptrics combine both, are compact, and sit in the
> middle on everything.
> **Mounts.** Alt-azimuth is simpler; equatorial tracks the sky's rotation on one axis.
> For photometry, meaning measuring brightness over time, tracking quality dominates
> everything else, because a drifting target ruins the measurement regardless of optics.
> **Detectors.** Eye, then DSLR, which is a genuine scientific instrument and not a
> compromise, then cooled astronomical CCD or CMOS. Each step gains sensitivity and
> dynamic range.
> **Match to the work.** Browser-only projects need nothing. Variable star photometry
> needs tracking and a detector. Spectroscopy needs considerably more. Buying before
> knowing which you want is how people end up with an unused telescope.

**Ask yourself:**
* What is the cheapest setup that would let me contribute usable data?
* Am I choosing equipment for the observing I do, or the observing I imagine?

## 6. First contributions, browser only

Real science with no equipment.

**Focus:** What are these projects actually asking of you? Why is human classification
still worth anything?

**Learn:**
* [Zooniverse](https://www.zooniverse.org/): the platform hosting most of these.
* [Galaxy Zoo](https://www.zooniverse.org/projects/zookeeper/galaxy-zoo/): morphology classification, the original project.
* [Planet Hunters TESS](https://www.zooniverse.org/projects/nora-dot-eisner/planet-hunters-tess): transit searching in light curves.

**Practice:** Complete the tutorial and one full session on one project. Then read a paper
that used that project's classifications and find where your kind of contribution appears
in the methods section.

**Self-check:** you can classify competently on one project and explain why the task has
not been fully automated.

> [!question]- Answer
> **What they ask.** Galaxy Zoo wants morphology: spiral, elliptical, irregular, merger.
> Planet Hunters TESS wants you to spot transit dips in light curves that pipelines may
> have missed. Disk Detective wants debris disk candidates separated from contaminating
> background galaxies. Backyard Worlds wants moving sources in infrared difference images.
> **Why humans still.** Automated pipelines are tuned for the typical case and are
> deliberately conservative, so they systematically miss the unusual. Humans are good at
> noticing that something is odd without having been told what odd looks like, which is
> exactly what finds the interesting objects. Several well-known discoveries, including
> Hanny's Voorwerp and the Boyajian's Star behaviour, came from volunteers noticing
> something did not fit.
> **How it becomes science.** Many independent classifications are aggregated, weighted by
> each classifier's demonstrated reliability, which makes the consensus robust to
> individual error. Galaxy Zoo alone has supported over a hundred peer-reviewed papers.
> **Doing it well.** Follow the tutorial exactly, use the Talk forum when something looks
> strange rather than guessing, and mark uncertainty honestly. A confident wrong
> classification is worse than an admitted uncertain one, because the aggregation can
> handle uncertainty and cannot detect overconfidence.

**Ask yourself:**
* When I am unsure, am I marking it or guessing?
* What would I do if I saw something that fit none of the categories?

## 7. Survey data and tools

Working with the archives directly.

**Focus:** What is FITS and why does everything use it? What does Astropy give you? How do
you read a light curve?

**Learn:**
* [Astropy](https://www.astropy.org/): units, coordinates, time, FITS, and archive queries.
* [Lightkurve](https://docs.lightkurve.org/): TESS and Kepler light curves in Python.
* [MAST archive](https://archive.stsci.edu/): the public archive for space telescope data.

**Practice:** Download a TESS light curve with `lightkurve`, plot it, and find a known
transit. Then open a FITS file and read its header to see what the observation actually
was.

**Self-check:** you can query an archive, open FITS, and read a light curve well enough to
say what is signal and what is systematics.

> [!question]- Answer
> **FITS.** Flexible Image Transport System, the standard format for astronomical images,
> spectra, and tables. The structure is a header of key-value metadata followed by a data
> unit, and the header is the point: it carries the coordinates, the instrument, the
> exposure, and the calibration state, so the file describes itself decades later. That
> longevity is why a format from the 1980s is still universal.
> **Astropy.** The central Python library, built on NumPy. It handles units so you cannot
> silently add arcseconds to degrees, coordinate frames and conversions, time scales,
> FITS, and queries to remote archives.
> **Light curves.** Brightness against time, the fundamental product of TESS, Kepler, and
> AAVSO photometry. A transit appears as a small, flat-bottomed, repeating dip. Reading
> one is a skill because most of what you see is not astrophysics: spacecraft momentum
> dumps, scattered light, detector systematics, and the star's own variability all leave
> marks that look like signals.
> **Archives.** MAST for space telescope data, ESA's Gaia archive, SDSS SkyServer, and
> Vizier for catalogues. All public, all free, all containing more than anyone has looked
> at.
> **Why notebooks.** Jupyter is the standard environment because analysis is exploratory
> and because a notebook is shareable and reproducible in a way a sequence of terminal
> commands is not.

**Ask yourself:**
* In this light curve, which features are the star and which are the spacecraft?
* Could someone else reproduce my analysis from what I saved?

## 8. Contributing with equipment

Producing data other people rely on.

**Focus:** Why are raw images not data? What makes differential photometry work? What does
AAVSO require?

**Learn:**
* [AAVSO CCD photometry guide](https://www.aavso.org/ccd-photometry-guide): the authoritative procedure.
* [APASS](https://www.aavso.org/apass): calibrated comparison stars.

**Practice:** Image a known variable star. Reduce it properly with bias, dark, and flat
frames. Perform differential photometry against APASS comparison stars, and submit the
result to AAVSO in their format.

**Self-check:** you can calibrate an image, produce differential photometry, and meet
submission requirements.

> [!question]- Answer
> **Raw images are not data.** A raw frame contains the sky plus detector bias, plus dark
> current that grows with exposure and temperature, plus a sensitivity variation across
> the field. Bias frames measure the offset, darks measure the thermal signal, flats
> measure the sensitivity variation. Without all three, your measured brightness is a
> property of your camera rather than of the star.
> **Differential photometry.** Measure your target relative to comparison stars in the
> same image. Atmospheric transparency, seeing, and equipment drift affect all stars in
> the frame together, so the ratio cancels them. This is what makes useful photometry
> possible from the ground through variable air.
> **Comparison stars.** Use APASS rather than picking stars that look steady. A
> comparison star that is itself variable puts a signal into your target that is not
> there, and it is a genuinely common failure.
> **Submission discipline.** AAVSO specifies formats, comparison conventions, and quality
> requirements. Following them is not bureaucracy: the database is only useful because
> observations from thousands of observers are comparable, and that only holds if everyone
> follows the same procedure.
> **Cadence.** Match the sampling to the phenomenon. Eclipsing binaries need minute
> cadence to catch ingress and egress; long-period variables are fine weekly.
> Oversampling wastes nights, undersampling misses the event.

**Ask yourself:**
* If my measurement disagreed with another observer's, how would I find out who was wrong?
* Is my comparison star actually constant, or did I assume it?

## 9. Specialising

Choosing where to go deep.

**Focus:** Which areas still benefit from amateur work? What does sustained contribution
look like?

**Learn:**
* [AAVSO](https://www.aavso.org/): variable stars, the longest-running amateur-professional collaboration.
* [Minor Planet Center](https://www.minorplanetcenter.net/): asteroid and comet astrometry.
* [International Astronomical Search Collaboration](http://iasc.cosmosearch.org/): structured discovery campaigns.

**Practice:** Pick one specialisation and commit to a season of regular contribution. Keep
a log. At the end, write up what you observed and what you learned about your own
observing limits.

**Self-check:** you have chosen a specialisation with reasons, and you have contributed
consistently rather than once.

> [!question]- Answer
> **Where amateurs still matter.** Variable stars, because the science needs long
> time-series across many targets and professionals cannot allocate that much telescope
> time. Exoplanet transit follow-up, for the same reason. Asteroid and comet astrometry,
> where discoveries still happen. Solar observing, where continuity across decades is the
> value. Galaxy morphology, where human classification remains useful at survey scale.
> **What sustained contribution looks like.** A small set of targets observed regularly
> over years, rather than many targets observed once. The scientific value of variable
> star photometry is almost entirely in the length of the baseline, which means
> consistency beats equipment.
> **How people end up on papers.** Not by asking. By contributing reliably enough that
> someone doing follow-up needs your data, or by noticing something in a Zooniverse Talk
> thread that turns into an investigation. Both take time and neither is the goal worth
> optimising for directly.
> **Choosing.** The honest filter is what you will still be doing in eighteen months given
> your sky, your equipment, and your actual free time. Enthusiasm picks the most exciting
> option; the log picks the one you will sustain.

**Ask yourself:**
* What will I still be doing in eighteen months, honestly?
* Is my contribution shaped by what is valuable, or by what is interesting to start?

## Capstone

A season of consistent observation in one specialisation, submitted to the relevant
database, with a written summary of what you observed, what your limits turned out to be,
and what you would change about your setup or procedure.

If you started browser-only, the equivalent is sustained classification on one project
plus one Talk thread you followed to a conclusion.

## Self-assessment checklist

- [ ] I can give the scale ladder and name the sub-fields.
- [ ] I can star-hop to a target and estimate magnitude by eye.
- [ ] I can read equatorial coordinates and explain sidereal time and epoch.
- [ ] I can infer temperature from colour and place a star on the HR diagram.
- [ ] I can justify equipment against a specific observing goal.
- [ ] I can classify competently on a Zooniverse project and mark uncertainty honestly.
- [ ] I can query an archive, open FITS, and read a light curve critically.
- [ ] I can calibrate frames and produce submittable differential photometry.
- [ ] I have chosen a specialisation and contributed consistently.
