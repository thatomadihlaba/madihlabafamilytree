/**
 * Family Tree App
 * 
 * Reads family-data.json and dynamically renders a family tree.
 * To update the tree, edit family-data.json and refresh the page.
 */

const DEFAULT_AVATAR_SVG = `
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v2h20v-2c0-3.33-6.67-5-10-5z"/>
  </svg>
`;

/**
 * Create the avatar element for a member
 */
function createAvatar(member) {
  const avatarWrapper = document.createElement('div');
  avatarWrapper.className = 'member-avatar';

  if (member.image && member.image.trim() !== '') {
    const img = document.createElement('img');
    img.src = member.image;
    img.alt = `Photo of ${member.name}`;
    img.onerror = function () {
      // If image fails to load, show default avatar
      this.parentElement.innerHTML = `<div class="default-avatar">${DEFAULT_AVATAR_SVG}</div>`;
    };
    avatarWrapper.appendChild(img);
  } else {
    avatarWrapper.innerHTML = `<div class="default-avatar">${DEFAULT_AVATAR_SVG}</div>`;
  }

  return avatarWrapper;
}

/**
 * Create a member card element
 */
function createMemberCard(member) {
  const card = document.createElement('div');
  card.className = `member-card gen-${member.generation}`;

  if (member.side) {
    card.classList.add(member.side);
  }

  card.dataset.id = member.id;

  const avatar = createAvatar(member);
  const info = document.createElement('div');
  info.className = 'member-info';
  info.innerHTML = `
    <span class="member-name">${member.name}</span>
    <span class="member-role">${member.role}</span>
  `;

  card.appendChild(avatar);
  card.appendChild(info);

  return card;
}

/**
 * Group members by generation
 */
function groupByGeneration(members) {
  const generations = {};
  members.forEach(member => {
    const gen = member.generation;
    if (!generations[gen]) {
      generations[gen] = [];
    }
    generations[gen].push(member);
  });
  return generations;
}

/**
 * Find couples (members who share children)
 */
function findCouples(members, generation) {
  const genMembers = members.filter(m => m.generation === generation);
  const couples = [];
  const paired = new Set();

  // Look at children to determine couples
  const children = members.filter(m => m.parents && m.parents.length === 2);

  children.forEach(child => {
    const parent1 = genMembers.find(m => m.id === child.parents[0]);
    const parent2 = genMembers.find(m => m.id === child.parents[1]);

    if (parent1 && parent2) {
      const coupleKey = [parent1.id, parent2.id].sort().join('-');
      if (!paired.has(coupleKey)) {
        paired.add(coupleKey);
        couples.push([parent1, parent2]);
      }
    }
  });

  // Add unpaired members
  const unpairedMembers = genMembers.filter(m => !paired.has(m.id) && ![...paired].some(key => key.includes(m.id)));

  return { couples, singles: unpairedMembers };
}

/**
 * Render the family tree
 */
function renderFamilyTree(data) {
  const container = document.getElementById('family-tree');
  const titleEl = document.getElementById('tree-title');
  const subtitleEl = document.getElementById('tree-subtitle');

  // Set header
  titleEl.textContent = data.title || 'Family Tree';
  subtitleEl.textContent = data.subtitle || '';

  // Update page title
  document.title = data.title || 'Family Tree';

  // Clear existing content
  container.innerHTML = '';

  const generations = groupByGeneration(data.members);
  const genNumbers = Object.keys(generations).map(Number).sort((a, b) => a - b);

  genNumbers.forEach((genNum, index) => {
    const genSection = document.createElement('div');
    genSection.className = 'generation';
    genSection.dataset.generation = genNum;

    const { couples, singles } = findCouples(data.members, genNum);

    // Render couples
    couples.forEach(([member1, member2]) => {
      const coupleGroup = document.createElement('div');
      coupleGroup.className = 'couple-group';

      const card1 = createMemberCard(member1);
      const connector = document.createElement('div');
      connector.className = 'couple-connector';
      const card2 = createMemberCard(member2);

      coupleGroup.appendChild(card1);
      coupleGroup.appendChild(connector);
      coupleGroup.appendChild(card2);
      genSection.appendChild(coupleGroup);
    });

    // Render singles
    singles.forEach(member => {
      const card = createMemberCard(member);
      genSection.appendChild(card);
    });

    container.appendChild(genSection);

    // Add connector between generations (except after the last one)
    if (index < genNumbers.length - 1) {
      const separator = document.createElement('div');
      separator.className = 'generation-separator';
      container.appendChild(separator);
    }
  });

  // Draw SVG connections after rendering
  requestAnimationFrame(() => drawConnections(data.members, container));
}

/**
 * Draw SVG connection lines between related members.
 * 
 * Handles wrapped/dynamic layouts:
 * - Lines are drawn based on actual rendered positions
 * - Groups siblings by parent to draw one set of lines per parent
 * - Uses a single trunk per parent, with branching to children
 * - Avoids overlapping by grouping before drawing
 */
function drawConnections(members, container) {
  // Remove existing SVG overlay
  const existingSvg = container.querySelector('.connection-lines');
  if (existingSvg) existingSvg.remove();

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.classList.add('connection-lines');
  svg.style.position = 'absolute';
  svg.style.top = '0';
  svg.style.left = '0';
  svg.style.width = '100%';
  svg.style.height = '100%';
  svg.style.pointerEvents = 'none';
  svg.style.zIndex = '1';

  const containerRect = container.getBoundingClientRect();

  function getCardMetrics(id) {
    const card = container.querySelector(`[data-id="${id}"]`);
    if (!card) return null;
    const rect = card.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2 - containerRect.left,
      top: rect.top - containerRect.top,
      bottom: rect.top + rect.height - containerRect.top,
      left: rect.left - containerRect.left,
      right: rect.left + rect.width - containerRect.left,
      midY: rect.top + rect.height / 2 - containerRect.top
    };
  }

  // Track drawn lines to avoid duplicates
  const drawnLines = new Set();

  function makeLine(x1, y1, x2, y2) {
    // Round to avoid floating point near-duplicates
    const key = `${Math.round(x1)},${Math.round(y1)}-${Math.round(x2)},${Math.round(y2)}`;
    const keyReverse = `${Math.round(x2)},${Math.round(y2)}-${Math.round(x1)},${Math.round(y1)}`;
    if (drawnLines.has(key) || drawnLines.has(keyReverse)) return;
    drawnLines.add(key);

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', '#5b6abf');
    line.setAttribute('stroke-width', '2');
    svg.appendChild(line);
  }

  // ===== COUPLE CONNECTIONS (two parents → children) =====
  const coupleMap = new Map();

  members.forEach(member => {
    if (!member.parents || member.parents.length < 2) return;
    const key = [...member.parents].sort().join('-');
    if (!coupleMap.has(key)) {
      coupleMap.set(key, { parents: member.parents, children: [] });
    }
    coupleMap.get(key).children.push(member.id);
  });

  coupleMap.forEach(({ parents, children }) => {
    const p1 = getCardMetrics(parents[0]);
    const p2 = getCardMetrics(parents[1]);
    if (!p1 || !p2) return;

    // Couple connector: horizontal line between the two parent cards
    const leftParent = p1.x < p2.x ? p1 : p2;
    const rightParent = p1.x < p2.x ? p2 : p1;
    const coupleLineY = (leftParent.midY + rightParent.midY) / 2;
    makeLine(leftParent.right, coupleLineY, rightParent.left, coupleLineY);

    // Midpoint of couple connector
    const coupleMidX = (leftParent.right + rightParent.left) / 2;

    // Get children positions
    const childMetrics = children
      .map(id => getCardMetrics(id))
      .filter(pos => pos !== null);

    if (childMetrics.length === 0) return;

    // Find closest child top to determine trunk length
    const closestChildTop = Math.min(...childMetrics.map(c => c.top));
    // T-bar Y is halfway between couple line and the closest child
    const tBarY = coupleLineY + (closestChildTop - coupleLineY) / 2;

    // Vertical trunk from couple midpoint down to T-bar
    makeLine(coupleMidX, coupleLineY, coupleMidX, tBarY);

    // For each child, draw from T-bar level to child
    childMetrics.forEach(child => {
      // Horizontal line from trunk to child's X at T-bar level
      if (Math.abs(child.x - coupleMidX) > 2) {
        makeLine(coupleMidX, tBarY, child.x, tBarY);
      }
      // But if child is below tBarY (on a different row), we need a longer vertical
      makeLine(child.x, tBarY, child.x, child.top);
    });

    // Draw a continuous horizontal bar across all child x-positions at tBarY
    if (childMetrics.length > 1) {
      const allXs = [...childMetrics.map(c => c.x), coupleMidX];
      const barLeft = Math.min(...allXs);
      const barRight = Math.max(...allXs);
      makeLine(barLeft, tBarY, barRight, tBarY);
    }
  });

  // ===== SINGLE-PARENT CONNECTIONS =====
  const singleParentMap = new Map();

  members.forEach(member => {
    if (!member.parents || member.parents.length !== 1) return;
    const parentId = member.parents[0];
    if (!singleParentMap.has(parentId)) {
      singleParentMap.set(parentId, []);
    }
    singleParentMap.get(parentId).push(member.id);
  });

  singleParentMap.forEach((childIds, parentId) => {
    const parent = getCardMetrics(parentId);
    if (!parent) return;

    const childMetrics = childIds
      .map(id => getCardMetrics(id))
      .filter(pos => pos !== null);

    if (childMetrics.length === 0) return;

    // Find closest child to determine T-bar position
    const closestChildTop = Math.min(...childMetrics.map(c => c.top));
    const tBarY = parent.bottom + (closestChildTop - parent.bottom) / 2;

    // Single vertical trunk from parent bottom to T-bar
    makeLine(parent.x, parent.bottom, parent.x, tBarY);

    if (childMetrics.length === 1) {
      const child = childMetrics[0];
      if (Math.abs(child.x - parent.x) > 2) {
        makeLine(parent.x, tBarY, child.x, tBarY);
      }
      makeLine(child.x, tBarY, child.x, child.top);
    } else {
      // Horizontal bar spanning all children + parent x
      const allXs = [...childMetrics.map(c => c.x), parent.x];
      const barLeft = Math.min(...allXs);
      const barRight = Math.max(...allXs);
      makeLine(barLeft, tBarY, barRight, tBarY);

      // Vertical drops to each child
      childMetrics.forEach(child => {
        makeLine(child.x, tBarY, child.x, child.top);
      });
    }
  });

  container.style.position = 'relative';
  container.appendChild(svg);
}

/**
 * Load the family data and render
 */
function init() {
  try {
    if (typeof FAMILY_DATA === 'undefined') {
      throw new Error('FAMILY_DATA not found. Make sure family-data.js is loaded before app.js');
    }

    renderFamilyTree(FAMILY_DATA);

    // Debounced redraw on resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        drawConnections(FAMILY_DATA.members, document.getElementById('family-tree'));
      }, 150);
    });

    // Also redraw after orientation change on mobile
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        drawConnections(FAMILY_DATA.members, document.getElementById('family-tree'));
      }, 300);
    });
  } catch (error) {
    console.error('Error loading family tree:', error);
    document.getElementById('family-tree').innerHTML = `
      <div style="text-align: center; padding: 60px; color: #e53935;">
        <h2>Could not load family data</h2>
        <p>Make sure <code>family-data.js</code> is in the same directory and loaded before <code>app.js</code>.</p>
        <p style="margin-top: 10px; color: #999; font-size: 0.9rem;">Error: ${error.message}</p>
      </div>
    `;
  }
}

// Start the app
init();
