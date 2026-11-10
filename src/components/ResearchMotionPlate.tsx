const mediaTracks = [
  {
    id: 'flex',
    index: '01',
    name: 'Droplet extinction',
    experiment: 'FLEX · ISS footage',
    description: 'Fuel droplets ignite as spherical flames in microgravity; the recorded test also shows residual cool-flame behavior after visible extinction.',
    source: 'NASA SVS · Great Balls of Fire',
    href: 'https://svs.gsfc.nasa.gov/11318/',
  },
  {
    id: 'bass',
    index: '02',
    name: 'Solid-fuel spread',
    experiment: 'PMMA · NASA SoFIE/GEL',
    description: 'NASA footage of a PMMA sample in a related solid-fuel experiment. FlameLens spread estimates still use the separate BASS-II records.',
    source: 'NASA SVS · solid-fuel study',
    href: 'https://svs.gsfc.nasa.gov/31394/',
  },
  {
    id: 'spice',
    index: '03',
    name: 'Coflow smoke point',
    experiment: 'SPICE · ISS flame',
    description: 'NASA’s SPICE photograph shows the luminous diffusion flame at the smoke point under controlled coflow.',
    source: 'NASA photo · SPICE',
    href: 'https://www.dvidshub.net/image/724916/smoke-point-co-flow-experiment',
  },
] as const;

export function ResearchMotionPlate() {
  return <section className="ml-motion-plate" aria-label="NASA combustion experiment media">
    {mediaTracks.map((track) => <article className={`ml-motion-scene ml-motion-scene-${track.id}`} key={track.id}>
      <div className="ml-motion-art" aria-hidden="true">
        {track.id === 'flex' ? <>
          <video className="ml-research-media ml-research-media-flex" autoPlay muted loop playsInline preload="metadata" poster="/images/research/nasa-flex-flame-poster.jpg">
            <source src="/videos/research/nasa-flex-droplet-test.mp4" type="video/mp4" />
          </video>
          <span className="ml-media-corner">RECORDED TEST</span>
        </> : track.id === 'bass' ? <>
          <img className="ml-research-media ml-research-media-bass" src="/images/research/nasa-sofie-pmma-flame.png" alt="" />
          <span className="ml-media-direction" aria-hidden="true"><i />PMMA FLAME</span>
          <span className="ml-media-corner">RELATED NASA FRAME</span>
        </> : <>
          <img className="ml-research-media ml-research-media-spice" src="/images/research/nasa-spice-smoke-point.jpg" alt="" />
          <span className="ml-smoke-marker" aria-hidden="true"><i />TIP</span>
          <span className="ml-media-corner">SOURCE IMAGE</span>
        </>}
        <div className="ml-media-vignette" />
      </div>
      <div className="ml-motion-copy">
        <div className="ml-motion-label"><span>{track.index} / {track.experiment}</span><i aria-hidden="true" /></div>
        <h3>{track.name}</h3>
        <p>{track.description}</p>
        <a href={track.href} target="_blank" rel="noreferrer">{track.source}<span aria-hidden="true">↗</span></a>
      </div>
    </article>)}
    <p className="ml-motion-caption"><span aria-hidden="true">NASA</span> Archival footage and photographs; decorative camera motion does not represent measured values.</p>
  </section>;
}
